import { Capture, Match, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';

import { ApiAdminStack } from '../../../../lib/api-admin.stack';

/**
 * TODO
 * - [ ] Use the openapi file as the inspiration for the tests
 * - [ ] find/write a library to unit test the VTL templates
 *       The following two didn't work; JS, and not AWS compliant (respectively)
 *       import * as renderVtlTemplate from 'api-gateway-mapping-template';
 *       import { render } from 'velocityjs';
 */

type SupportedStatusCode = '500' | '400' | '200';
const supportedStatusCodes: SupportedStatusCode[] = ['500', '400', '200'];

// These functions would/will support VTL testing
// type RequestResponse = 'request' | 'response';
// function input(rr: RequestResponse) {
//   return readJson(`${rr}.input`);
// }
// function expectedOutput(rr: RequestResponse) {
//   return readJson(`${rr}.output`);
// }
// function readJson(filename: string) {
//   const jsonFilepath = pathResolve(__dirname, `./data/${filename}.json`);
//   const data = readFileSync(jsonFilepath, 'utf8');
//   return JSON.parse(data);
// }

describe('ApiAdminStack : hook', () => {
  let app: cdk.App;
  let stack: ApiAdminStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    stack = new ApiAdminStack(app, 'ApiAdminStack');
    template = Template.fromStack(stack);
  });

  describe('/courses/{eventType}/{courseSourceId}?{updatedStatus?}', () => {
    const resourceParentRegex = 'apiadmincourseshookeventType[A-Z0-9]+';
    const resourceIdRegex =
      'apiadmincourseshookeventTypecourseSourceId[A-Z0-9]+';
    const responseMethodSuccessModelRegex =
      'apiadminresponsemodelhookeventsuccess[A-Z0-9]+';

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
      const methodResponses = new Capture();
      const requestParameters = new Capture();
      const requestValidator = new Capture();
      const integrationResponses = new Capture();
      const requestTemplates = new Capture();

      it('Should exist', () => {
        template.hasResourceProperties('AWS::ApiGateway::Method', {
          HttpMethod: 'GET',
          ResourceId: {
            Ref: Match.stringLikeRegexp(resourceIdRegex),
          },
          Integration: {
            IntegrationResponses: integrationResponses,
            RequestTemplates: requestTemplates,
          },
          MethodResponses: methodResponses,
          RequestParameters: requestParameters,
          RequestValidatorId: requestValidator,
        });
      });

      //   test('With credentials', () => {
      //     expect(integrationCapture.asObject().Credentials).toBeDefined();
      //   });

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
      test('And basic GET request validator', () => {
        expect(requestValidator.asObject()).toBeDefined();
      });

      /**
       * TODO
       * - [ ] use external library to validate VTL template
       */
      test('And a valid request template', () => {
        expect(requestTemplates.asObject()['application/json']).toBeTruthy();
        // TODO better VTL template testing
        // const renderedTemplate = render(
        //   requestTemplates.asObject()['application/json'],
        //   input('request')
        // );
        // expect(JSON.parse(renderedTemplate)).toEqual(expectedOutput('request'));
      });

      /**
       * TODO:
       * - [ ] test the selectionPattern??
       * - [ ] test the integration response templates
       */
      describe('With four integration responses', () => {
        test('Of supported status codes', () => {
          const responses = integrationResponses.asArray();
          const responseCodes: SupportedStatusCode[] = [];
          responses.forEach((response) => {
            responseCodes.push(response.StatusCode);
          });
          expect(responseCodes).toEqual(
            expect.arrayContaining(supportedStatusCodes)
          );
        });

        test('And functioning success response template', () => {
          const responses = integrationResponses.asArray();
          const successResponse = responses.find(
            (response) => response.StatusCode === '200'
          );
          expect(successResponse.ResponseTemplates['application/json']).toEqual(
            expect.stringContaining('Event received')
          );
        });
      });

      /**
       * TODO
       * - [ ] test ResponseParameters align with our CORS policy
       */
      describe('With four method responses', () => {
        test('Of supported status codes', () => {
          const responses = methodResponses.asArray();
          const responseCodes: SupportedStatusCode[] = [];
          responses.forEach((response) => {
            responseCodes.push(response.StatusCode);
          });
          expect(responseCodes).toEqual(
            expect.arrayContaining(supportedStatusCodes)
          );
        });

        test('Success returning the course response DTO model', () => {
          const responses = methodResponses.asArray();
          const successResponse = responses.find(
            (response) => response.StatusCode === '200'
          );
          expect(
            successResponse.ResponseModels['application/json'].Ref
          ).toEqual(expect.stringMatching(responseMethodSuccessModelRegex));
        });
      });
    });
  });
});
