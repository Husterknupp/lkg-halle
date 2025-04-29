const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { createCalendarClient } = require("../google-calendar");
const { readEvents } = require("../csv-parser");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc"); // timezone plugin depends on it
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

async function run() {
  // dotenv preserves CLI arguments (in GitHub CI for instance). See `override` dotenv config prop
  dotenv.config();

  const events = await readEvents(
    process.argv[2] || getAlphabeticallyLastFileName("./input-csvs") // default to latest file
  );

  if (events.length === 0) {
    console.log("Done. No events found to update.");
    return;
  }

  await updateGoogleCalendar(events);
  console.log(
    "Done. All events have been successfully updated in Google Calendar."
  );
}

function getAlphabeticallyLastFileName(directory) {
  const files = fs.readdirSync(directory);
  const sortedFiles = files.sort((a, b) => b.localeCompare(a));
  return path.join(directory, sortedFiles[0]);
}

async function updateGoogleCalendar(events) {
  const calendar = await createCalendarClient();

  for (const event of events) {
    const summary = event.name;
    const description = getDescription(event, summary);
    const location = getLocation(summary);
    const time = getStartAndEndTime(event);

    if (await shouldSkipEvent(summary, time, calendar)) {
      continue;
    }

    // `insert` method throws for error responses
    const result = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: {
        summary,
        description,
        location,
        ...time,
      },
    });

    console.log(
      `Event created for ${event.dateTime} -- ID: ${result.data.id} -- Link: ${result.data.htmlLink}`
    );
  }
}

function getDescription(event, summary) {
  if (summary.toLowerCase().indexOf("gottesdienst") === -1) {
    return "";
  }

  const description = [];
  if (event.preaching !== "") {
    description.push(`Predigt: ${event.preaching}`);
  }
  if (event.moderator !== "") {
    description.push(`Moderation: ${event.moderator}`);
  }

  return description.join(" • ");
}

function getLocation(summary) {
  if (summary.toLowerCase().indexOf("stammtisch") !== -1) {
    return '"My Sen" Vietnamesisches Restaurant + Biergarten, Beesener Str. 38, 06110 Halle (Saale)';
  } else {
    return "Landeskirchliche Gemeinschaft (LKG) Halle e.V., Ludwig-Stur-Straße 5, 06108 Halle (Saale)";
  }
}

const TZ_BERLIN = "Europe/Berlin";

function getStartAndEndTime(event) {
  // Google Calendar event format
  return {
    start: {
      dateTime: dayjs.tz(event.dateTime, TZ_BERLIN).format(),
      timeZone: TZ_BERLIN,
    },
    end: {
      dateTime: dayjs
        .tz(event.dateTime, TZ_BERLIN)
        .add(event.lengthInHours, "hour")
        .format(),
      timeZone: TZ_BERLIN,
    },
  };
}

async function shouldSkipEvent(newEventSummary, time, calendar) {
  const maybeExisting = (
    await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: dayjs.tz(time.start.dateTime, TZ_BERLIN).format(),
      timeMax: dayjs.tz(time.end.dateTime, TZ_BERLIN).format(),
      timezone: TZ_BERLIN,
      maxResults: 1,
      singleEvents: true,
      orderBy: "startTime",
    })
  ).data.items[0];

  if (maybeExisting === undefined) {
    return false;
  }

  if (
    newEventSummary.toLocaleLowerCase() ===
    maybeExisting.summary.toLocaleLowerCase()
  ) {
    console.log(
      `I see two events with the same name on the same day: Event '${maybeExisting.summary}' is already in the calendar (from ${maybeExisting.start.dateTime} to ${maybeExisting.end.dateTime}). Not adding it a second time.`
    );
    return true;
  } else {
    return false;
  }
}

run().catch(console.error);
