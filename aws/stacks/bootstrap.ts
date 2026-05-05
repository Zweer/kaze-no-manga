import { CfnOutput, Duration, Stack, type StackProps } from 'aws-cdk-lib';
import {
  Effect,
  OpenIdConnectProvider,
  PolicyStatement,
  Role,
  WebIdentityPrincipal,
} from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

const GITHUB_REPO = 'Zweer/kaze-no-manga';

export class BootstrapStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const oidcProvider = new OpenIdConnectProvider(this, 'GitHubOidc', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1'],
    });

    const role = new Role(this, 'GitHubActionsRole', {
      roleName: 'kaze-no-manga-ci',
      maxSessionDuration: Duration.hours(1),
      assumedBy: new WebIdentityPrincipal(oidcProvider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO}:*`,
        },
      }),
    });

    role.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cloudformation:*', 'ssm:GetParameter', 'sts:AssumeRole'],
        resources: ['*'],
      }),
    );

    role.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          's3:*',
          'lambda:*',
          'dynamodb:*',
          'appsync:*',
          'cognito-idp:*',
          'cloudfront:*',
          'iam:*',
          'logs:*',
          'events:*',
          'sqs:*',
        ],
        resources: ['*'],
      }),
    );

    new CfnOutput(this, 'RoleArn', {
      value: role.roleArn,
      description: 'ARN of the GitHub Actions CI role — add as AWS_ROLE_ARN secret',
    });
  }
}
