import { createHeanCmsSource } from '../../multi/heancms';

export const omegascans = createHeanCmsSource({
  id: 'omegascans',
  name: 'Omega Scans',
  baseUrl: 'https://omegascans.org',
  useNewChapterEndpoint: true,
});
