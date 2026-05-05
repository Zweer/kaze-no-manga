import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../stacks/auth.js';
import { ApiStack } from '../stacks/api.js';
import { StorageStack } from '../stacks/storage.js';
import { FrontendStack } from '../stacks/frontend.js';
import { JobsStack } from '../stacks/jobs.js';

const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-west-1' };

const auth = new AuthStack(app, 'KazeAuth', { env });
const storage = new StorageStack(app, 'KazeStorage', { env });
const api = new ApiStack(app, 'KazeApi', { env, userPool: auth.userPool });
const jobs = new JobsStack(app, 'KazeJobs', { env });
new FrontendStack(app, 'KazeFrontend', { env });
