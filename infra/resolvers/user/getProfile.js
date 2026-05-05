import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const userId = ctx.identity.sub;
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues({
      pk: `USER#${userId}`,
      sk: `PROFILE`,
    }),
  };
}

export function response(ctx) {
  return ctx.result;
}
