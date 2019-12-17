import {
  APIGatewayProxyHandler,
} from 'aws-lambda';
import 'source-map-support/register';
import note from './note'
import mergeRequest from './merge_request'
import {
  HandlerFunction
} from './types'
import * as util from 'util'
import { fixEvent } from './helpers';

const router: Map < string, HandlerFunction > = new Map < string,
  HandlerFunction > ();
router.set('note', note)
router.set('merge_request', mergeRequest)


export const event: APIGatewayProxyHandler = async (event, _context) => {
  event = fixEvent(event);
  console.log(`event Request ${util.inspect(event)}`)
  const body: any = event.body;
  const objectKind = body.object_kind;
  const handlerFunction = router.get(objectKind)
  const response = {
    message: `Don't have a handler for this event '${objectKind}'`,
    input: event,
  };
  const unKnownEventResponse = {
    statusCode: 200,
    response,
    body: JSON.stringify(response, null, 2),
  };
  if (handlerFunction === null || handlerFunction === undefined) {
    console.log(`event Response ${util.inspect(unKnownEventResponse)}`)
    return unKnownEventResponse;
  }
  const res = await handlerFunction(event, _context)
  console.log(`event Response ${util.inspect(res)}`)
  return res;
}