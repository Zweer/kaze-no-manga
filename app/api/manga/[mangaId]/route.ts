import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { mangaId: string } },
) {
  try {
    const manga = await prisma.manga.findUnique({
      where: { id: params.mangaId },
      include: {
        chapters: true, // Include chapters in the response
      },
    });

    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    return NextResponse.json(manga);
  }
  catch (error) {
    console.error(`Error fetching manga "${params.mangaId}" from database:`, error);

    return NextResponse.json(
      { error: 'Failed to fetch manga' },
      { status: 500 },
    );
  }
}
