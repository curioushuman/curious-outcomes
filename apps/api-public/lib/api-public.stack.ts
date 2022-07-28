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

export class ApiPublicStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * API Gateway
     */
    const apiPublic = new CoApiConstruct(this, 'api-public', {
      description: 'Curious Outcomes Public API',
      applicationNamePrefix: 'Co',
      stageName: 'dev',
    });

    /**
     * Common response models
     * i.e. these are the structures for data that will be returned from THIS API
     */

    /**
     * Course
     * NOTE: the below does not include the externalId
     *       as this is not necessary info for the public
     * TODO
     * - [ ] can we move this to a schema dir or similar
     * - [ ] we also need to align with the openapi schema yaml
     */
    apiPublic.addResponseModel('course-response-dto', {
      properties: {
        id: { type: apigateway.JsonSchemaType.STRING },
        name: { type: apigateway.JsonSchemaType.STRING },
        slug: { type: apigateway.JsonSchemaType.STRING },
      },
    });

    /**
     * Root Resources for the API
     */
    const courses = apiPublic.api.root.addResource('courses');

    /**
     * findOne
     * GET /courses/{id}?{slug?}
     */
    const coursesFind = courses.addResource('{id}');

    /**
     * findOne construct
     * NOTE: this pares away a lot of the setup for this resource
     */
    const coursesFindConstruct = new FindOneConstruct(
      this,
      'courses-find-one',
      { apiConstruct: apiPublic } as FindOneProps
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
     * Outputs
     */
    new cdk.CfnOutput(this, 'apiUrl', { value: apiPublic.api.urlForPath() });
  }
}
