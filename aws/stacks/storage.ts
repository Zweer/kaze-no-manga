import { RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { CachePolicy, Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

export class StorageStack extends Stack {
  public readonly imagesBucket: Bucket;
  public readonly cdn: Distribution;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.imagesBucket = new Bucket(this, 'ImagesBucket', {
      removalPolicy: RemovalPolicy.RETAIN,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
    });

    this.cdn = new Distribution(this, 'CDN', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(this.imagesBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
      },
    });
  }
}
