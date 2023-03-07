const dotenv = require("dotenv");
const dayjs = require("dayjs");
const { createCalendarClient } = require("../google-calendar");

async function createCalendarEvents(events) {
  const calendar = await createCalendarClient();

  for (const event of events) {
    let summary = event.name;
    if (!summary) {
      // No control over imported CSV - it comes with a funny space character
      summary = event["﻿name"];
    }
    const description =
      summary.toLowerCase().indexOf("gottesdienst") !== -1
        ? `Predigt: ${event.preaching} • Moderation: ${event.moderator}`
        : undefined;

    const locationAndTime = {
      location:
        "Landeskirchliche Gemeinschaft (LKG) Halle e.V., Ludwig-Stur-Straße 5, 06108 Halle (Saale)",
      start: {
        dateTime: event.dateTime,
        timeZone: "Europe/Berlin",
      },
      end: {
        dateTime: dayjs(event.dateTime).add(event.lengthInHours, "hour"),
        timeZone: "Europe/Berlin",
      },
    };

    const maybeExisting = (
      await calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        timeMin: dayjs(locationAndTime.start.dateTime).format(),
        timeMax: dayjs(locationAndTime.end.dateTime).format(),
        maxResults: 1,
        singleEvents: true,
        orderBy: "startTime",
      })
    ).data.items[0];

    if (maybeExisting !== undefined) {
      console.log(
        `Duplicate event on ${locationAndTime.start.dateTime}. Event with name ${maybeExisting.summary} already exists. (Name in the CSV: ${summary}).`
      );
      console.log("Not adding anything.");
      continue;
    }

    // Throws for error responses
    const result = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: { summary, description, ...locationAndTime },
    });
    console.log(`Event created for ${event.dateTime}:`, result.data.htmlLink);
  }
}

async function run() {
  // Dotenv preserves CLI arguments (in GitHub CI for instance). See `override` dotenv config prop
  dotenv.config();
  const fileName = process.argv[2];
  if (!fileName) {
    throw Error("Missing csv file argument (file path)");
  }

  // neat-csv library comes as esm-only (and b/c codecept I don't know how to switch to type: module completely)
  const { readEvents } = await import("../csv-parser/index.mjs");
  const events = await readEvents(fileName);
  await createCalendarEvents(events);
  return "Done";
}

run().then(console.log).catch(console.error);
