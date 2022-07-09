import { Capture, Match, Template } from 'aws-cdk-lib/assertions';
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

  describe('Should support the following endpoints', () => {
    describe('/courses/hook/{eventType}/{courseId}', () => {
      const integrationCapture = new Capture();
      const methodResponsesCapture = new Capture();
      const resourceParentRegex = 'apiadmincourseshookeventType[A-Z0-9]+';
      const resourceIdRegex = 'apiadmincourseshookeventTypecourseId[A-Z0-9]+';

      it('Should exist', () => {
        // TODO: I would prefer to be more specific with this test
        // Difficult to do as a one off, but I might be able to write
        // some supporting functions to test such things.
        // e.g. https://thomasstep.com/blog/how-to-write-aws-cdk-tests
        template.hasResourceProperties('AWS::ApiGateway::Resource', {
          PathPart: '{courseId}',
          ParentId: {
            Ref: Match.stringLikeRegexp(resourceParentRegex),
          },
        });
      });

      describe('GET', () => {
        it('Should exist', () => {
          template.hasResourceProperties('AWS::ApiGateway::Method', {
            HttpMethod: 'GET',
            ResourceId: {
              Ref: Match.stringLikeRegexp(resourceIdRegex),
            },
            Integration: integrationCapture,
            MethodResponses: methodResponsesCapture,
          });
        });
        test('With credentials', () => {
          expect(integrationCapture.asObject().Credentials).toBeDefined();
        });
        // TODO: I'm not sure exactly how to do this
        test.todo('With a request template that includes lambda');
        test.todo('With a request template that includes sqs');
        test.todo('With a request template that includes default');
        test('With two method responses', () => {
          const methodResponses = methodResponsesCapture.asArray();
          expect(methodResponses.length).toBe(2);
          expect(methodResponses[0].StatusCode).toBe('200');
          expect(methodResponses[1].StatusCode).toBe('400');
        });
      });
    });
  });
});
