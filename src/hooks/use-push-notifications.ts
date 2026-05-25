import { useCallback, useEffect, useState } from 'react';

import { getPushStatus, subscribePush, unsubscribePush } from '~/server/functions/notifications';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(): {
  supported: boolean;
  subscribed: boolean;
  loading: boolean;
  toggle: () => Promise<void>;
} {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isSupported =
      'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY;
    setSupported(isSupported);

    if (!isSupported) {
      setLoading(false);
      return;
    }

    getPushStatus()
      .then((status) => setSubscribed(status.subscribed))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = useCallback(async () => {
    if (!supported) return;
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      if (subscribed) {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await unsubscribePush({ data: { endpoint: sub.endpoint } });
          await sub.unsubscribe();
        }
        setSubscribed(false);
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setLoading(false);
          return;
        }

        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
        });

        const keys = sub.toJSON().keys!;
        await subscribePush({
          data: {
            endpoint: sub.endpoint,
            p256dh: keys.p256dh!,
            auth: keys.auth!,
          },
        });
        setSubscribed(true);
      }
    } catch {
      // Permission denied or other error
    } finally {
      setLoading(false);
    }
  }, [supported, subscribed]);

  return { supported, subscribed, loading, toggle };
}
