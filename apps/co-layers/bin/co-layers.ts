#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CoLayersStack } from '../lib/co-layers-stack';

const devEnv = {
  account: '793735516609',
  region: 'ap-southeast-2',
};

const app = new cdk.App();
new CoLayersStack(app, 'CoLayersStack', { env: devEnv });
