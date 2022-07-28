import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';

import { ApiPublicStack } from '../api-public.stack';

/**
 * TODO
 * - [ ] Use the openapi file as the inspiration for the tests
 * - [ ] test api Role has access to lambdas, and topic
 */

describe('ApiPublicStack', () => {
  let app: cdk.App;
  let stack: ApiPublicStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    stack = new ApiPublicStack(app, 'ApiPublicStack');
    template = Template.fromStack(stack);
  });

  it('Should contain an API', () => {
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  });
});
