import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, it } from 'vitest';

import { StorageStack } from './storage.js';

describe('StorageStack', () => {
  it('should create an S3 bucket and CloudFront distribution', () => {
    const app = new App();
    const stack = new StorageStack(app, 'TestStorage');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::S3::Bucket', 1);
    template.resourceCountIs('AWS::CloudFront::Distribution', 1);
  });
});
