import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';

export class JobsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // TODO: EventBridge rule (daily chapter check)
    // TODO: SQS queue (scraper jobs)
    // TODO: Lambda function (scraper worker)
  }
}
