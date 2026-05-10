import { omegascans } from './sources/omegascans';
import type { Source } from './types';

export const sources: Source[] = [omegascans];

export function getSource(id: string): Source | undefined {
  return sources.find((s) => s.id === id);
}
