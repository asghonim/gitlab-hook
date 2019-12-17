import 'source-map-support/register';
import * as util from 'util'
import {HandlerFunction} from './types'

export const note: HandlerFunction = async (event, _context) => {
  console.log(`note Request ${util.inspect(event)}`)
  const res = {
    statusCode: 200,
    bodyz: '',
    body: JSON.stringify({
      message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
    }, null, 2),
  };
  console.log(`note Response ${util.inspect(res)}`)
  return res;
}
export default note;