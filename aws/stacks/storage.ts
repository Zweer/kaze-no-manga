import { RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { CachePolicy, Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

import { PROJECT_NAME } from '../constants.js';

export class StorageStack extends Stack {
  public readonly imagesBucket: Bucket;
  public readonly cdn: Distribution;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.imagesBucket = new Bucket(this, 'ImagesBucket', {
      bucketName: `${this.account}-${PROJECT_NAME}-images`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
    });

    this.cdn = new Distribution(this, 'CDN', {
      comment: `${PROJECT_NAME}-images-cdn`,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(this.imagesBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
      },
    });
  }
}
