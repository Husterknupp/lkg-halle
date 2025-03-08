const dotenv = require("dotenv");
const dayjs = require("dayjs");
const fs = require("fs");
const path = require("path");
const { createCalendarClient } = require("../google-calendar");
const { readEvents } = require("../csv-parser");

function shouldSkipEvent(newEventSummary, maybeExisting) {
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

async function updateGoogleCalendar(events) {
  const calendar = await createCalendarClient();

  for (const event of events) {
    const summary = event.name;

    const description = [];
    if (summary.toLowerCase().indexOf("gottesdienst") !== -1) {
      if (event.preaching !== "") {
        description.push(`Predigt: ${event.preaching}`);
      }
      if (event.moderator !== "") {
        description.push(`Moderation: ${event.moderator}`);
      }
    }

    let location =
      "Landeskirchliche Gemeinschaft (LKG) Halle e.V., Ludwig-Stur-Straße 5, 06108 Halle (Saale)";
    if (summary.toLowerCase().indexOf("stammtisch") !== -1) {
      location =
        '"My Sen" Vietnamesisches Restaurant + Biergarten, Beesener Str. 38, 06110 Halle (Saale)';
    }

    // Google Calendar event format
    const time = {
      start: {
        dateTime: dayjs(event.dateTime).format(),
        timeZone: "Europe/Berlin",
      },
      end: {
        dateTime: dayjs(event.dateTime)
          .add(event.lengthInHours, "hour")
          .format(),
        timeZone: "Europe/Berlin",
      },
    };

    const maybeExisting = (
      await calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        timeMin: dayjs(time.start.dateTime).format(),
        timeMax: dayjs(time.end.dateTime).format(),
        maxResults: 1,
        singleEvents: true,
        orderBy: "startTime",
      })
    ).data.items[0];

    if (shouldSkipEvent(summary, maybeExisting)) {
      continue;
    }

    // `insert` method throws for error responses
    const result = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: {
        summary,
        description: description.join(" • "),
        location,
        ...time,
      },
    });
    console.log(`Event created for ${event.dateTime}:`, result.data.htmlLink);
  }
}

function getAlphabeticallyLastFileName(directory) {
  const files = fs.readdirSync(directory);
  const sortedFiles = files.sort((a, b) => b.localeCompare(a));
  return path.join(directory, sortedFiles[0]);
}

async function run() {
  // dotenv preserves CLI arguments (in GitHub CI for instance). See `override` dotenv config prop
  dotenv.config();

  const events = await readEvents(
    process.argv[2] || getAlphabeticallyLastFileName("./input-csvs")
  );

  await updateGoogleCalendar(events);
  console.log("Done.");
}

run().catch(console.error);
