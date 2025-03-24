import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const take = 10; // default value
  const page = Number(searchParams.get('page') ?? 1); // default page: 1
  const skip = (page - 1) * take;

  try {
    const mangas = await prisma.manga.findMany({
      take, // Limit the number of results per page
      skip,
      orderBy: {
        updatedAt: 'desc', // Order by last updated
      },
    });

    return NextResponse.json(mangas);
  }
  catch (error) {
    console.error('Error fetching manga from database:', error);

    return NextResponse.json(
      { error: 'Failed to fetch manga' },
      { status: 500 },
    );
  }
}
