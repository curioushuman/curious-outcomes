#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CoLayersStack } from '../lib/co-layers-stack';

import { resolve as pathResolve } from 'path';
import * as dotenv from 'dotenv';

// these will pick up whatever profile you run your CDK commands with
// see aw cli configuration
let account = process.env.CDK_DEFAULT_ACCOUNT;
let region = process.env.CDK_DEFAULT_REGION;

// this will pick up our local environments
if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'hybrid') {
  // cwd will be the app root
  dotenv.config({ path: pathResolve(process.cwd(), '../../.env') });
  account = process.env.CDK_DEPLOY_ACCOUNT;
  region = process.env.CDK_DEPLOY_REGION;
}

// creating an app in cloud or local
const app = new cdk.App();
new CoLayersStack(app, 'CoLayersStack', {
  env: {
    account,
    region,
  },
});
