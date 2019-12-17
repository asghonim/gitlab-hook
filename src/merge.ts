import 'source-map-support/register';
import {HandlerFunction} from './types'
import propagate from './propagate'
import * as util from 'util'

export const merge: HandlerFunction = async (event, _context) => {
  const body: any = event.body;
  console.log(`merge Request ${util.inspect(event)}`)
  const object_attributes = body.object_attributes;
  const target_branch = object_attributes.target_branch;
  const target = object_attributes.target;
  const default_branch = target.default_branch
  const target_is_default = default_branch == target_branch;
  const should_propagate = target_is_default;

  const handlers: HandlerFunction[] = Array<HandlerFunction>();
  if (should_propagate) {
    handlers.push(propagate)
  }

  const allResults = await Promise.all(handlers.map(h => h(event, _context)))
  const response = {
    message: 'merge',
    input: event,
    allResults,
  }
  const res = {
    statusCode: 200,
    response,
    body: JSON.stringify(response, null, 2),
  };
  console.log(`merge Response ${util.inspect(res)}`)
  return res;
  
}
export default merge;