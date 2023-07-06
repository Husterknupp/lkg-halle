const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const fs = require("fs");
const readline = require("readline");
const dayjs = require("dayjs");
const { readEvents } = require("../csv-parser");

// API YouTube/v3/live
// https://developers.google.com/youtube/v3/live/docs/liveBroadcasts/insert?apix_params=%7B%22resource%22%3A%7B%7D%7D#try-it
// request params: https://developers.google.com/youtube/v3/live/docs/liveBroadcasts/insert?apix_params=%7B%22resource%22%3A%7B%7D%7D#request-body
// Live Streaming API is part of the YouTube Data API v3: https://developers.google.com/youtube/v3/live/getting-started
//   (different than the Livestream API, that is not YouTube Data API v3)
// Calling the Data API: secrets.json file belongs to technical project; authorization (open link in browser, select Google account, ..) must be done by Google account/YouTube channel under which the broadcast should be listed
//   - see https://developers.google.com/youtube/v3/live/getting-started

// Authorization part: authorize script, copy & paste `code=<..>` part from url

// OAUTH page: https://console.cloud.google.com/apis/credentials/consent

// Thanks! oAuth Step 23 @ https://medium.com/automationmaster/getting-google-oauth-access-token-using-google-apis-18b2ba11a11a

// If modifying these scopes, delete your previously saved access token / credentials
// at ~/.credentials/<TOKEN>.json
const SCOPES = ["https://www.googleapis.com/auth/youtube"];

/////////////////
// 👇 auth client
/////////////////

// $ node src/youtube_update/index.js <EVENTS_CSV_FILE> <SECRETS.JSON>
const SECRET_FILE = process.argv[3] || "./client_secret_youtube.json";

// ERROR: invalid_grant | code: '400' ??
//    $ rm -f ~/.credentials/*

const TOKEN_DIR = `${
  process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
}/.credentials/`;
const TOKEN_PATH = `${
  process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
}/.credentials/lkg-halle-youtube-update.json`;

async function createAuthClient() {
  const secret = fs.readFileSync(SECRET_FILE, { encoding: "utf-8" });
  // Authorize a client with the loaded credentials, then call the YouTube API.
  return await authorizedClient(JSON.parse(secret));
}

async function authorizedClient(credentials) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

  try {
    // Check if we have previously stored a token.
    const maybeToken = fs.readFileSync(TOKEN_PATH, { encoding: "utf-8" });
    oauth2Client.setCredentials(JSON.parse(maybeToken).tokens);
    console.log("using existing token at", TOKEN_PATH);
    return oauth2Client;
  } catch (err) {
    return await getNewToken(oauth2Client);
  }
}

/**
 * Get and store new token after prompting for user authorization.
 *
 * @param {OAuth2Client} oauth2Client The OAuth2 client to get token for.
 */
async function getNewToken(oauth2Client) {
  // todo maybe use localhost:3000 server version (see example in docs: https://github.com/googleapis/google-auth-library-nodejs#oauth2)
  // to avoid having to manually copy-paste code=.. from browser

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url: ", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    // if the callback url is `http://localhost:3000/?code=4/lalala_12093u_shalela&scope=https://www.googleapis.com/auth/youtube.readonly`
    // the code is `4/lalala_12093u_shalela`
    rl.question("Enter the code from that page here: ", resolve);
  });
  rl.close();

  const token = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(token.tokens);

  storeTokenSync(token);

  return oauth2Client;
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeTokenSync(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token), { encoding: "utf-8" });
  console.log("Token stored to " + TOKEN_PATH);
}

/////////////////
// 👆 auth client
/////////////////

////////////////////
// 👇 business logic
////////////////////

// Create a new YouTube Live Broadcast
async function createLiveBroadcasts(events) {
  const authClient = await createAuthClient();
  console.log("oAuth successful");

  try {
    for (const event of events) {
      if (!event.isStreamable) {
        console.log("no stream event.. skip");
        continue;
      }

      let description = event.name;
      if (event.preaching && event.preaching !== "0") {
        description += "\nPredigt: " + event.preaching;
      }
      if (event.moderator && event.moderator !== "0") {
        description += "\nModeration: " + event.moderator;
      }

      const dateTime = dayjs(event.dateTime);
      const broadcast = {
        snippet: {
          title: `LKG Halle | ${dateTime.format(
            "D.MM.YY"
          )} | Gottesdienst um ${dateTime.format("HH:mm")} Uhr`,
          scheduledStartTime: dateTime.subtract(10, "minute").format(), // requires ISO8601
          description,
        },
        status: {
          privacyStatus: "public",
        },
      };

      const res = await google.youtube("v3").liveBroadcasts.insert({
        auth: authClient,
        part: "snippet,status",
        resource: broadcast,
      });

      console.log(
        `Gottesdienst on ${dateTime.format(
          "D.MM.YY"
        )} successfully inserted! Broadcast:`,
        `https://studio.youtube.com/video/${res.data.id}/edit`
      );
    }
  } catch (err) {
    if (err.response && err.response.data.error.details) {
      console.error(
        "Error inserting upcoming stream:",
        err.response.data.error.details
      );
    } else if (err.errors) {
      console.error(
        err.errors
          .map((error) => `${error.reason.toUpperCase()}: ${error.message}`)
          .join("\n")
      );
    } else {
      console.error("Error inserting upcoming stream:", err);
    }
  }
}

async function run() {
  // todo move client_secret_youtube.json content to .dotenv config file
  const events = await readEvents(
    process.argv[2] || "./veranstaltungen-lkg.csv"
  );
  await createLiveBroadcasts(events);
  console.log("Done.");
}

run().catch(console.error)
