#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { ApiAdminStack } from '../lib/api-admin.stack';

const devEnv = {
  account: '793735516609',
  region: 'ap-southeast-2',
};

const app = new cdk.App();
new ApiAdminStack(app, 'ApiAdminStack', { env: devEnv });
