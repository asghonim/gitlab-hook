import { RequestOptions } from "https";
import { URL } from "url";
import * as https from "https";

export function fixEvent(event) {
  event.body = JSON.parse(event.body);
  return event;
}


export function httpsPromise(options: RequestOptions | string | URL): Promise<string|null|undefined> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        resolve(data);
      });
    });

    req.on("error", (err) => {
      reject(err)
    });

    req.write("");
    req.end();
  });
}