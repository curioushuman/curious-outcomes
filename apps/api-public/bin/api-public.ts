#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { ApiPublicStack } from '../lib/api-public.stack';

const devEnv = {
  account: '793735516609',
  region: 'ap-southeast-2',
};

const app = new cdk.App();
new ApiPublicStack(app, 'ApiPublicStack', { env: devEnv });
