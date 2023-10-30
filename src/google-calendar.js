const { JWT } = require("google-auth-library");
const { google } = require("googleapis");

async function createAuthClient() {
  const jwtClient = new JWT(
    process.env.SERVICE_ACCOUNT_EMAIL,
    null,
    process.env.SERVICE_ACCOUNT_PRIVATE_KEY,
    [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.events.readonly",
      "https://www.googleapis.com/auth/calendar.readonly",
    ]
  );

  await jwtClient.authorize((err) => {
    if (err) {
      throw err;
    }
  });

  console.log("Google auth successful\n");
  return jwtClient;
}

async function createCalendarClient() {
  return google.calendar({
    version: "v3",
    auth: await createAuthClient(),
  });
}

module.exports = { createCalendarClient };
