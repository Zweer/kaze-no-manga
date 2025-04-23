import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { searchMangas } from '@/lib/manga';

// We might not need Auth here unless searching is restricted
// import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Optional: Check auth if needed
  // const session = await auth();
  // if (!session?.user) {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  if (!query || query.length < 3) {
    return NextResponse.json({ error: 'Invalid search query' }, { status: 400 });
  }

  console.log(`Searching external manga (API Route) for query: "${query}"`);

  try {
    const results = await searchMangas(query.trim());

    console.log(`Found ${results.length} external results (API Route) for query: "${query}"`);

    // Return the results
    return NextResponse.json({ results });
  } catch (error) {
    console.error(`Error searching external manga (API Route) for query: "${query}"`, error);
    // Return a generic error response
    return NextResponse.json({ error: 'Failed to search external sources.' }, { status: 500 });
  }
}

// Optional: Force Node.js runtime if scraper needs it, otherwise default is fine
export const runtime = 'nodejs';
