import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, it } from 'vitest';

import { AuthStack } from './auth.js';

describe('AuthStack', () => {
  it('should create User Pool, Google IdP, Client, and Domain', () => {
    const app = new App();
    const stack = new AuthStack(app, 'TestAuth');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::Cognito::UserPool', 1);
    template.resourceCountIs('AWS::Cognito::UserPoolIdentityProvider', 1);
    template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
    template.resourceCountIs('AWS::Cognito::UserPoolDomain', 1);
  });
});
