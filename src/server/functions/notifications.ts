import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '~/lib/db';
import { pushSubscription } from '~/lib/db/schema';
import { authMiddleware } from '~/server/middleware/auth';

export const subscribePush = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((input: { endpoint: string; p256dh: string; auth: string }) => input)
  .handler(async ({ data, context }) => {
    const id = `${context.session.user.id}:${Buffer.from(data.endpoint).toString('base64url').slice(0, 32)}`;

    await db
      .insert(pushSubscription)
      .values({
        id,
        userId: context.session.user.id,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
      })
      .onConflictDoNothing();

    return { success: true };
  });

export const unsubscribePush = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((input: { endpoint: string }) => input)
  .handler(async ({ data }) => {
    await db.delete(pushSubscription).where(eq(pushSubscription.endpoint, data.endpoint));
    return { success: true };
  });

export const getPushStatus = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const subs = await db
      .select({ id: pushSubscription.id })
      .from(pushSubscription)
      .where(eq(pushSubscription.userId, context.session.user.id))
      .limit(1);

    return { subscribed: subs.length > 0 };
  });
