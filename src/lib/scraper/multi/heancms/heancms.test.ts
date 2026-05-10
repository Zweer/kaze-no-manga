import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createHeanCmsSource } from './index';

const source = createHeanCmsSource({
  id: 'test-source',
  name: 'Test Source',
  baseUrl: 'https://example.com',
  apiUrl: 'https://api.example.com',
  useNewChapterEndpoint: true,
});

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HeanCms', () => {
  describe('search', () => {
    it('should return manga results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 42,
              series_slug: 'solo-leveling',
              title: 'Solo Leveling',
              thumbnail: 'https://cdn.example.com/cover.jpg',
              author: null,
              description: null,
              status: null,
              tags: null,
              seasons: null,
            },
          ],
          meta: { current_page: 1, last_page: 3 },
        }),
      });

      const result = await source.search({ query: 'solo' });

      expect(result.mangas).toHaveLength(1);
      expect(result.mangas[0]).toEqual({
        sourceId: '42',
        sourceName: 'test-source',
        slug: 'solo-leveling',
        title: 'Solo Leveling',
        cover: 'https://cdn.example.com/cover.jpg',
      });
      expect(result.hasNextPage).toBe(true);
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: null }),
      });

      const result = await source.search({ query: 'nonexistent' });

      expect(result.mangas).toHaveLength(0);
      expect(result.hasNextPage).toBe(false);
    });
  });

  describe('getManga', () => {
    it('should return manga detail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 42,
          series_slug: 'solo-leveling',
          title: 'Solo Leveling',
          thumbnail: '/covers/solo.jpg',
          author: 'Chugong',
          description: '<p>A weak hunter becomes the strongest.</p>',
          status: 'Ongoing',
          tags: [{ name: 'Action' }, { name: 'Fantasy' }],
          seasons: null,
        }),
      });

      const manga = await source.getManga('solo-leveling');

      expect(manga.title).toBe('Solo Leveling');
      expect(manga.author).toBe('Chugong');
      expect(manga.description).toBe('A weak hunter becomes the strongest.');
      expect(manga.status).toBe('ongoing');
      expect(manga.genres).toEqual(['Action', 'Fantasy']);
      expect(manga.cover).toBe('https://api.example.com/covers/solo.jpg');
    });
  });

  describe('getChapters', () => {
    it('should return chapters filtering paid ones', async () => {
      // First call: get series ID
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 42, series_slug: 'solo-leveling' }),
      });
      // Second call: chapter list
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 1,
              chapter_name: 'Chapter 1',
              chapter_title: 'The Beginning',
              chapter_slug: 'chapter-1',
              created_at: '2024-01-15T10:00:00.000Z',
              price: 0,
            },
            {
              id: 2,
              chapter_name: 'Chapter 2',
              chapter_title: null,
              chapter_slug: 'chapter-2',
              created_at: '2024-01-16T10:00:00.000Z',
              price: 100,
            },
          ],
          meta: { current_page: 1, last_page: 1 },
        }),
      });

      const chapters = await source.getChapters('solo-leveling');

      expect(chapters).toHaveLength(1);
      expect(chapters[0]).toEqual({
        sourceId: '1',
        slug: 'chapter-1',
        number: 1,
        title: 'The Beginning',
        sourceUrl: 'https://example.com/series/solo-leveling/chapter-1',
        publishedAt: new Date('2024-01-15T10:00:00.000Z'),
      });
    });
  });

  describe('getPages', () => {
    it('should return page images', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          chapter: {
            chapter_data: {
              images: ['https://cdn.example.com/page1.jpg', 'https://cdn.example.com/page2.jpg'],
            },
          },
          data: null,
          paywall: false,
        }),
      });

      const pages = await source.getPages('solo-leveling', 'chapter-1');

      expect(pages).toHaveLength(2);
      expect(pages[0]).toEqual({ index: 0, imageUrl: 'https://cdn.example.com/page1.jpg' });
      expect(pages[1]).toEqual({ index: 1, imageUrl: 'https://cdn.example.com/page2.jpg' });
    });

    it('should throw on paywalled chapter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          chapter: { chapter_data: null },
          data: null,
          paywall: true,
        }),
      });

      await expect(source.getPages('solo-leveling', 'chapter-5')).rejects.toThrow('paywalled');
    });
  });
});
