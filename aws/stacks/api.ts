import { RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { AuthorizationType, Definition, GraphqlApi } from 'aws-cdk-lib/aws-appsync';
import type { UserPool } from 'aws-cdk-lib/aws-cognito';
import { AttributeType, Billing, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
  userPool: UserPool;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // DynamoDB table (single-table design)
    const table = new TableV2(this, 'MainTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      billing: Billing.onDemand(),
      removalPolicy: RemovalPolicy.RETAIN,
      globalSecondaryIndexes: [
        {
          indexName: 'gsi1',
          partitionKey: { name: 'gsi1pk', type: AttributeType.STRING },
          sortKey: { name: 'gsi1sk', type: AttributeType.STRING },
        },
      ],
    });

    // AppSync API
    const api = new GraphqlApi(this, 'Api', {
      name: 'kaze-api',
      definition: Definition.fromFile('../packages/models/graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.USER_POOL,
            userPoolConfig: { userPool: props.userPool },
          },
        ],
      },
    });

    // DynamoDB data source
    api.addDynamoDbDataSource('MainTableDS', table);

    // TODO: Add JS resolvers
  }
}
