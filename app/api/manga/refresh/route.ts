import { refreshMangas } from '@/lib/manga';

export async function GET() {
  await refreshMangas();

  return Response.json({ success: true });
}
