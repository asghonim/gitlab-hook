import 'source-map-support/register';
import {HandlerFunction} from './types'
import merge from './merge'
import * as util from 'util'

const router: Map<string, HandlerFunction> = new Map<string, HandlerFunction>();
router.set('merge', merge)

export const mergeRequest: HandlerFunction = async (event, _context) => {
  console.log(`merge_request Request ${util.inspect(event)}`)
  const body: any = event.body;
  const object_attributes = body.object_attributes;
  const action = object_attributes.action;
  const handlerFunction = router.get(action);
  const response = {
    message: `Don't have a handler for this action '${action}'`,
    input: event,
  }
  const unKnownHandlerResponse = {
    statusCode: 200,
    response,
    body: JSON.stringify(response, null, 2),
  };
  if (handlerFunction === null || handlerFunction === undefined) {
    console.log(`merge_request Response ${util.inspect(unKnownHandlerResponse)}`)
    return unKnownHandlerResponse;
  }
  const res = await handlerFunction(event, _context);
  console.log(`merge_request Response ${util.inspect(res)}`)
  return res;
}
export default mergeRequest;