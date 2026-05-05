import type { ChapterInfo, ChapterPage, MangaDetail, MangaSearchResult, MangaSource } from '../types.js';

export class OmegaScansSource implements MangaSource {
  readonly name = 'OmegaScans';
  readonly baseUrl = 'https://omegascans.org';

  async search(_query: string): Promise<MangaSearchResult[]> {
    // TODO: implement
    throw new Error('Not implemented');
  }

  async getManga(_sourceId: string): Promise<MangaDetail> {
    throw new Error('Not implemented');
  }

  async getChapters(_sourceId: string): Promise<ChapterInfo[]> {
    throw new Error('Not implemented');
  }

  async getChapterPages(_sourceId: string, _chapterSourceId: string): Promise<ChapterPage[]> {
    throw new Error('Not implemented');
  }
}
