import { App } from 'aws-cdk-lib';

import { ApiStack } from '../stacks/api.js';
import { AuthStack } from '../stacks/auth.js';
import { FrontendStack } from '../stacks/frontend.js';
import { JobsStack } from '../stacks/jobs.js';
import { StorageStack } from '../stacks/storage.js';

const app = new App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-west-1' };

const auth = new AuthStack(app, 'KazeAuth', { env });
new StorageStack(app, 'KazeStorage', { env });
new ApiStack(app, 'KazeApi', { env, userPool: auth.userPool });
new JobsStack(app, 'KazeJobs', { env });
new FrontendStack(app, 'KazeFrontend', { env });
