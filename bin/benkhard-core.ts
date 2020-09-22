#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BenkhardCoreStack } from '../lib/benkhard-core-stack';

const app = new cdk.App();
new BenkhardCoreStack(app, 'BenkhardCoreStack');
