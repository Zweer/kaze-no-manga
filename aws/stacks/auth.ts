import { CfnOutput, SecretValue, Stack, type StackProps } from 'aws-cdk-lib';
import {
  OAuthScope,
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolDomain,
  UserPoolIdentityProviderGoogle,
} from 'aws-cdk-lib/aws-cognito';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct } from 'constructs';

const SSM_PREFIX = '/kaze-no-manga/auth';

export class AuthStack extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const googleClientId = StringParameter.valueForStringParameter(
      this,
      `${SSM_PREFIX}/google-client-id`,
    );

    const googleClientSecret = SecretValue.secretsManager(`${SSM_PREFIX}/google-client-secret`);

    this.userPool = new UserPool(this, 'UserPool', {
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: false },
      },
    });

    const googleProvider = new UserPoolIdentityProviderGoogle(this, 'Google', {
      userPool: this.userPool,
      clientId: googleClientId,
      clientSecretValue: googleClientSecret,
      scopes: ['openid', 'email', 'profile'],
      attributeMapping: {
        email: ProviderAttribute.GOOGLE_EMAIL,
        givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
        familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
        profilePicture: ProviderAttribute.GOOGLE_PICTURE,
      },
    });

    const domain = new UserPoolDomain(this, 'Domain', {
      userPool: this.userPool,
      cognitoDomain: { domainPrefix: 'kaze-no-manga' },
    });

    this.userPoolClient = new UserPoolClient(this, 'WebClient', {
      userPool: this.userPool,
      supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PROFILE],
        callbackUrls: [
          'http://localhost:3000/auth/callback',
          'https://placeholder.cloudfront.net/auth/callback',
        ],
        logoutUrls: ['http://localhost:3000/', 'https://placeholder.cloudfront.net/'],
      },
      generateSecret: false,
    });

    // Ensure Google provider is created before the client
    this.userPoolClient.node.addDependency(googleProvider);

    new CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });
    new CfnOutput(this, 'CognitoDomain', {
      value: `${domain.domainName}.auth.${this.region}.amazoncognito.com`,
    });
  }
}
