import { eq } from 'drizzle-orm';
import webpush from 'web-push';

import { db } from '~/lib/db';
import { pushSubscription } from '~/lib/db/schema';

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'admin@example.com'}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/** Send push notification to all subscriptions for a given user */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  const subs = await db.select().from(pushSubscription).where(eq(pushSubscription.userId, userId));

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
      ),
    ),
  );

  // Clean up expired/invalid subscriptions
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'rejected' && 'statusCode' in (result.reason as object)) {
      const statusCode = (result.reason as { statusCode: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await db.delete(pushSubscription).where(eq(pushSubscription.id, subs[i].id));
      }
    }
  }
}
