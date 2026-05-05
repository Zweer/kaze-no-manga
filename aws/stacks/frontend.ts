import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // TODO: Lambda@Edge for React Router v7 SSR
    // TODO: CloudFront distribution for web app
    // TODO: S3 bucket for static assets
  }
}
