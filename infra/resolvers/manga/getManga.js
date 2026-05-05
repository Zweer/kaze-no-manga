import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues({
      pk: `MANGA#${ctx.args.id}`,
      sk: `MANGA#${ctx.args.id}`,
    }),
  };
}

export function response(ctx) {
  return ctx.result;
}
