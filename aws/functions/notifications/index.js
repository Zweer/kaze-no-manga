// Notifications Lambda handler
// Sends email (SES) and push notifications for new chapters

export async function handler(event) {
  for (const record of event.Records) {
    const { userId, mangaTitle, chapterNumber } = JSON.parse(record.body);
    // TODO: Send email via SES
    // TODO: Send web push notification
    console.log(`Notifying user ${userId}: ${mangaTitle} ch.${chapterNumber}`);
  }
}
