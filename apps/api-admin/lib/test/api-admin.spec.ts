import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { ApiAdminStack } from '../api-admin.stack';

describe('ApiAdminStack', () => {
  let app: cdk.App;
  let stack: ApiAdminStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    stack = new ApiAdminStack(app, 'ApiAdminStack');
    template = Template.fromStack(stack);
  });

  it('Should contain a topic', () => {
    template.resourceCountIs('AWS::SNS::Topic', 1);
  });

  it('Should contain an API', () => {
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  });

  // TODO: get rid of this one, not a very good test
  it('Should contain a single endpoint', () => {
    template.resourceCountIs('AWS::ApiGateway::Resource', 4);
  });
});
