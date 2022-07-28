import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import { CoApiConstruct } from '../../../dist/local/@curioushuman/co-cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/co-cdk-utils';

import {
  FindOneConstruct,
  FindOneProps,
} from '../src/courses/find-one/find-one.construct';
import { HookConstruct, HookProps } from '../src/courses/hook/hook.construct';

export class ApiAdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * API Gateway
     */
    const apiAdmin = new CoApiConstruct(this, 'api-admin', {
      description: 'Curious Outcomes Admin API',
      applicationNamePrefix: 'Co',
      stageName: 'dev',
    });

    /**
     * Common response models
     * i.e. these are the structures for data that will be returned from THIS API
     */

    /**
     * Course
     *
     * TODO
     * - [ ] can we move this to a schema dir or similar
     * - [ ] we also need to align with the openapi schema yaml
     */
    apiAdmin.addResponseModel('course-response-dto', {
      properties: {
        id: { type: apigateway.JsonSchemaType.STRING },
        externalId: { type: apigateway.JsonSchemaType.STRING },
        name: { type: apigateway.JsonSchemaType.STRING },
        slug: { type: apigateway.JsonSchemaType.STRING },
      },
    });

    /**
     * Courses
     */
    const courses = apiAdmin.api.root.addResource('courses');

    /**
     * findOne
     * GET /courses/{id}?{slug?}
     */
    const coursesFind = courses.addResource('{externalId}');

    /**
     * findOne construct
     * NOTE: this pares away a lot of the setup for this resource
     */
    const coursesFindConstruct = new FindOneConstruct(
      this,
      'courses-find-one',
      { apiConstruct: apiAdmin } as FindOneProps
    );

    /**
     * findOne: method definition
     * - custom (non-proxy) lambda integration
     */
    coursesFind.addMethod(
      'GET',
      coursesFindConstruct.lambdaIntegration,
      coursesFindConstruct.methodOptions
    );

    /**
     * Hook for external events
     * GET /courses/{eventType}/{courseSourceId}?{updatedStatus?}
     *
     * TODO:
     * - [ ] idempotency for the hook
     *       do we assume each hit of the hook is an independent event?
     *       can we do it another way? Maybe specific to the event?
     *       https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/
     */
    const coursesHook = courses.addResource('hook');
    const coursesHookType = coursesHook.addResource('{eventType}');
    const coursesHookTypeAndId =
      coursesHookType.addResource('{courseSourceId}');

    /**
     * hook construct
     */
    const coursesHookConstruct = new HookConstruct(this, 'courses-hook', {
      apiConstruct: apiAdmin,
    } as HookProps);

    /**
     * hook: method definition
     * - SNS integration
     */
    coursesHookTypeAndId.addMethod(
      'GET',
      coursesHookConstruct.snsIntegration,
      coursesHookConstruct.methodOptions
    );

    /**
     * Outputs
     */
    new cdk.CfnOutput(this, 'apiUrl', { value: apiAdmin.api.urlForPath() });
  }
}
