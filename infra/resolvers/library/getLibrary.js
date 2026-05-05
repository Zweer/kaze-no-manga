import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const userId = ctx.identity.sub;
  return {
    operation: 'Query',
    query: {
      expression: 'pk = :pk AND begins_with(sk, :sk)',
      expressionValues: util.dynamodb.toMapValues({
        ':pk': `USER#${userId}`,
        ':sk': 'LIBRARY#',
      }),
    },
  };
}

export function response(ctx) {
  return ctx.result.items;
}
