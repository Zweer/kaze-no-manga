import { index, layout, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('auth/callback', 'routes/auth.callback.tsx'),
  layout('routes/_protected.tsx', [route('app', 'routes/app._index.tsx')]),
] satisfies RouteConfig;
