import { Capture, Match, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';

import { ApiAdminStack } from '../api-admin.stack';

/**
 * TODO
 * - [ ] Use the openapi file as the inspiration for the tests
 */

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
    describe('/courses/hook/{eventType}/{courseSourceId}?{updatedStatus?}', () => {
      const resourceParentRegex = 'apiadmincourseshookeventType[A-Z0-9]+';
      const resourceIdRegex =
        'apiadmincourseshookeventTypecourseSourceId[A-Z0-9]+';

      it('Should exist', () => {
        template.hasResourceProperties('AWS::ApiGateway::Resource', {
          PathPart: '{courseSourceId}',
          ParentId: {
            Ref: Match.stringLikeRegexp(resourceParentRegex),
          },
        });
      });

      // TODO: test authorization
      describe('GET', () => {
        const integrationCapture = new Capture();
        const methodResponsesCapture = new Capture();
        const requestValidator = new Capture();
        const requestParameters = new Capture();

        it('Should exist', () => {
          template.hasResourceProperties('AWS::ApiGateway::Method', {
            HttpMethod: 'GET',
            ResourceId: {
              Ref: Match.stringLikeRegexp(resourceIdRegex),
            },
            Integration: integrationCapture,
            MethodResponses: methodResponsesCapture,
            RequestParameters: requestParameters,
            RequestValidatorId: requestValidator,
          });

          // TODO: what else within this structure should we be testing?
          // console.log('integrationCapture', integrationCapture.asObject());
        });
        test('With credentials', () => {
          expect(integrationCapture.asObject().Credentials).toBeDefined();
        });
        test('With the relevant parameters', () => {
          expect(
            requestParameters.asObject()['method.request.path.eventType']
          ).toBeTruthy();
          expect(
            requestParameters.asObject()['method.request.path.courseSourceId']
          ).toBeTruthy();
          expect(
            requestParameters.asObject()[
              'method.request.querystring.updatedStatus'
            ]
          ).toBeDefined();
        });
        // TODO: can we improve this?
        // Difficult to do, as the ref is quite anonymous
        // RequestValidatorId { Ref: 'apiadminvalidator1165B6E4' }
        test('With basic GET request validator', () => {
          expect(requestValidator.asObject()).toBeDefined();
        });
        test('With two method responses', () => {
          const methodResponses = methodResponsesCapture.asArray();
          expect(methodResponses.length).toBe(2);
          expect(methodResponses[0].StatusCode).toBe('200');
          expect(methodResponses[1].StatusCode).toBe('400');
        });
        // TODO: I'm not sure exactly how to do this
        describe('Should include request templates for', () => {
          // const requestTemplates = new Capture();
          // beforeAll(() => {
          //   template.hasResourceProperties('AWS::ApiGateway::Method', {
          //     Integration: {
          //       RequestTemplates: {
          //         'application/json': requestTemplates,
          //       },
          //     },
          //   });
          // });
          test.todo('Lambda');
          test.todo('SQS');
          test.todo('Default');
        });
      });
    });
  });
});
