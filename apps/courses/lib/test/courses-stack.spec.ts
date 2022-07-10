import { Capture, Match, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';

import { CoursesStack } from '../courses.stack';

/**
 * TODO
 * - [ ] Use the openapi file as the inspiration for the tests
 */

describe('CoursesStack', () => {
  let app: cdk.App;
  let stack: CoursesStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    stack = new CoursesStack(app, 'CoursesStack');
    template = Template.fromStack(stack);
  });

  describe('Should contain a lambda for creating courses', () => {
    it('Should exist', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Tags: [
          {
            Key: 'identifier',
            Value: 'CreateCourseFunction',
          },
        ],
      });
    });

    // TODO: additional tests for the lambda

    describe('Should be subscribed to the ExternalEvents SNS topic', () => {
      const filterPolicy = new Capture();
      const subscriptionEndpointRegex = 'CreateCourseFunction[A-Z0-9]+';

      it('Should exist', () => {
        // TODO
        template.hasResourceProperties('AWS::SNS::Subscription', {
          Protocol: 'lambda',
          Endpoint: {
            'Fn::GetAtt': [
              Match.stringLikeRegexp(subscriptionEndpointRegex),
              Match.anyValue(),
            ],
          },
          FilterPolicy: filterPolicy,
        });
      });
      it('Should be filtered to messages of object=Course, type=Created', () => {
        const filterPolicyObj = filterPolicy.asObject();
        expect(filterPolicyObj.object).toEqual(['Course']);
        expect(filterPolicyObj.type).toEqual(['Created']);
      });
    });
  });
});
