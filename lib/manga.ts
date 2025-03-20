import { connectors } from '@zweer/manga-scraper';

export async function refreshMangas() {
  await Object.entries(connectors).reduce(async (promise, [name, connector]) => {
    await promise;

    const mangas = await connector.getMangas();
    console.log(`[${name}] ${mangas.length} mangas found`);
  }, Promise.resolve());
}

refreshMangas();
