const { JWT } = require("google-auth-library");
const { google } = require("googleapis");

async function createAuthClient() {
  const jwtClient = new JWT({
    email: process.env.SERVICE_ACCOUNT_EMAIL,
    key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.events.readonly",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
  });

  console.log("Authorizing Google Calendar API...");
  await jwtClient.authorize();

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
