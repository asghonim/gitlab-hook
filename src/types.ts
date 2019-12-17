import { APIGatewayProxyResult } from "aws-lambda";

export type HandlerFunction = (event: any, _context: any) => Promise<APIGatewayProxyResult>;