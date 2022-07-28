import { Template } from 'aws-cdk-lib/assertions';
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

    // TODO: tests for find-course lambda
  });
});
