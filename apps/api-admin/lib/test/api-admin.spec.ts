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

  it('Should contain an API', () => {
    // Assert it creates an API Gateway
    // template.hasResourceProperties("AWS::ApiGateway::RestApi", {
    //   Handler: "handler",
    // });
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  });
});
