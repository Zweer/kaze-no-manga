import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { searchMangas } from '@/lib/manga';

const searchSchema = z.object({
  q: z.string().min(3, 'Search query must be at least 3 characters'), // Minimum query length
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q');

  const validation = searchSchema.safeParse({ q: query });

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.flatten().fieldErrors.q?.[0] || 'Invalid search query' }, { status: 400 });
  }

  const searchQuery = validation.data.q;
  const results = await searchMangas(searchQuery);

  const limitedResults = results.slice(0, 15);

  return NextResponse.json(limitedResults);
}
