import { APIGatewayProxyEvent } from 'aws-lambda';
/**
 * A partial-ish type (using TS.Pick) to represent just the API event data
 * we are going to use. Makes for simpler testing as well.
 */
export type FindCourseApiGatewayRequestEvent = Pick<
  APIGatewayProxyEvent,
  'body'
>;
