import { App } from 'aws-cdk-lib';

import { BootstrapStack } from '../stacks/bootstrap.js';

const app = new App();

new BootstrapStack(app, 'KazeBootstrap', {
  env: { region: 'eu-west-1' },
});
