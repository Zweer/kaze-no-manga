import { index, layout, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  route('auth/callback', 'routes/auth.callback.tsx'),
  layout('routes/_protected.tsx', [index('routes/_index.tsx')]),
] satisfies RouteConfig;
