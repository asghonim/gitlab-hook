import 'source-map-support/register';
import * as util from 'util'
import * as https from 'https'
import {
  HandlerFunction
} from './types'
import {httpsPromise} from './helpers'

const isSameTarget = (merge_request, event): boolean => {
  const body: any = event.body;
  const object_attributes = body.object_attributes;
  const target_branch = object_attributes.target_branch;
  return merge_request.target_branch == target_branch;
}

const mergeRequestPromise = async (merge_request, event): Promise<string|null|undefined> => {
  const token = event.headers['X-Gitlab-Token'];
  const body: any = event.body;
  const object_attributes = body.object_attributes;
  const target = object_attributes.target;
  return new Promise<string|null|undefined>(async (resolve, _) => {
    const same_target = isSameTarget(merge_request, event);
    if (!same_target) {
      resolve();
    }
    console.log("propagate Rebasing " + merge_request.iid + " " + merge_request.source_branch);
    const options = {
      hostname: 'gitlab.com',
      port: 443,
      path: '/api/v4/projects/' + target.id + '/merge_requests/' + merge_request.iid + '/rebase',
      method: 'PUT',
      headers: {
        'PRIVATE-TOKEN': token
      }
    };
    const res = await httpsPromise(options);
    console.log("propagate Rebase DONE " + merge_request.iid + " " + merge_request.source_branch, res);
  })
}

const handleMergeError = (err, event) => {
  const response = {
    message: `Something wrong happened ${err.message}`,
    input: event,
  }
  const errorMessage = {
    statusCode: 200,
    response,
    body: JSON.stringify(response, null, 2),
  };
  console.log(`propagate Response ${util.inspect(errorMessage)}`);
  return errorMessage;
}

export const propagate: HandlerFunction = async (event, _context) => {
  console.log(`propagate Request ${util.inspect(event)}`)
  const token = event.headers['X-Gitlab-Token'];
  const body: any = event.body;
  const object_attributes = body.object_attributes;
  const target = object_attributes.target;
  

  

  const handleMergeRequest = async (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', async () => {
      const merge_requests = JSON.parse(data);

      await Promise.all(merge_requests.map(merge_request => new Promise(async (resolve, _) => {
        const same_target = isSameTarget(merge_request, event);
        if (!same_target) {
          resolve();
        }
        console.log("Rebasing " + merge_request.iid + " " + merge_request.source_branch);
        const options = {
          hostname: 'gitlab.com',
          port: 443,
          path: '/api/v4/projects/' + target.id + '/merge_requests/' + merge_request.iid + '/rebase',
          method: 'PUT',
          headers: {
            'PRIVATE-TOKEN': token
          }
        };
        resolve(await new Promise(async (resolve, reject) => { 
          const req = https.request(options, (resp) => {
            let data = '';
  
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
              data += chunk;
            });
  
            resp.on('end', () => {
              console.log("Rebase DONE " + merge_request.iid + " " + merge_request.source_branch, data);
              resolve({merge_request :merge_request.iid, success: true});
            });
          });
  
          req.on("error", (err) => {
            reject({merge_request :merge_request.iid, success: false, err: err})
          });
  
          req.write("");
          req.end();
        }));
      })))
    });
  }

  const merge_requests = JSON.parse(await httpsPromise(
    `https://gitlab.com/api/v4/projects/${target.id}/merge_requests?` +
    `state=opened` +
    `&per_page=100` +
    `&order_by=updated_at` +
    `&sort=desc` +
    `&private_token=${token}`));
  const merge_requests_map = merge_requests.map(merge_request => mergeRequestPromise(merge_request, event));
  await Promise.all(merge_requests_map)
  
  const response = {
    message: 'All done',
    input: event,
  }
  const allDone = {
    statusCode: 200,
    response,
    body: JSON.stringify(response, null, 2),
  };
  console.log(`propagate Response ${util.inspect(allDone)}`);
  return allDone;
}
export default propagate;