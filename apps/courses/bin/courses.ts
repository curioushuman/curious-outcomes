#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CoursesStack } from '../lib/courses.stack';

const devEnv = {
  account: '793735516609',
  region: 'ap-southeast-2',
};

const app = new cdk.App();
new CoursesStack(app, 'CoursesStack', { env: devEnv });
