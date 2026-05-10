import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/image-proxy')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const imageUrl = url.searchParams.get('url');

        if (!imageUrl) {
          return new Response('Missing url parameter', { status: 400 });
        }

        try {
          const res = await fetch(imageUrl, {
            headers: {
              Referer: new URL(imageUrl).origin + '/',
              Accept: 'image/*',
            },
          });

          if (!res.ok) {
            return new Response('Failed to fetch image', { status: res.status });
          }

          return new Response(res.body, {
            headers: {
              'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        } catch {
          return new Response('Proxy error', { status: 502 });
        }
      },
    },
  },
});
