const google = require("googleapis").google;

async function createAuthClient() {
  // todo secrets properly
  const private_key = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;
  const client_email = process.env.SERVICE_ACCOUNT_EMAIL;

  const jwtClient = new google.auth.JWT(client_email, null, private_key, [
    // 'https://www.googleapis.com/auth/calendar.readonly' , // lists the explicit invites with only that

    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.events.readonly",
    "https://www.googleapis.com/auth/calendar.readonly",
  ]);

  await jwtClient.authorize(function (err) {
    if (err) {
      throw err;
    }
  });

  return jwtClient;
}

module.exports = async () => {
  const auth = await createAuthClient();

  const calendar = google.calendar("v3");
  try {
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      auth,
    });
    console.log(`found ${(response.data.items || []).length} items`);
    return response.data.items;
  } catch (err) {
    console.error("The API returned an error: " + err);
    throw err;
  }
};
