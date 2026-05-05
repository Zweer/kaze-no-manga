// Scraper Lambda handler
// Triggered by SQS messages to scrape manga chapters

export async function handler(event) {
  for (const record of event.Records) {
    const { mangaId, sourceId, sourceName } = JSON.parse(record.body);
    // TODO: Use @kaze-no-manga/scraper to fetch chapters
    // TODO: Upload images to S3
    // TODO: Update DynamoDB with new chapters
    console.log(`Scraping manga ${mangaId} from ${sourceName}`);
  }
}
