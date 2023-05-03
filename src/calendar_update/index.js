const dotenv = require("dotenv");
const dayjs = require("dayjs");
const { createCalendarClient } = require("../google-calendar");
const { readEvents } = require("../csv-parser");

async function updateGoogleCalendar(events) {
  const calendar = await createCalendarClient();

  for (const event of events) {
    const summary = event.name;
    const description =
      summary.toLowerCase().indexOf("gottesdienst") !== -1
        ? `Predigt: ${event.preaching} • Moderation: ${event.moderator}`
        : undefined;

    let location =
      "Landeskirchliche Gemeinschaft (LKG) Halle e.V., Ludwig-Stur-Straße 5, 06108 Halle (Saale)";
    if (summary.toLowerCase().indexOf("männer-stammtisch") !== -1) {
      location =
        '"My Sen" Vietnamesisches Restaurant + Biergarten, Beesener Str. 38, 06110 Halle (Saale)';
    }

    const time = {
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
        timeMin: dayjs(time.start.dateTime).format(),
        timeMax: dayjs(time.end.dateTime).format(),
        maxResults: 1,
        singleEvents: true,
        orderBy: "startTime",
      })
    ).data.items[0];

    if (maybeExisting !== undefined) {
      console.log(
        `Duplicate event on ${time.start.dateTime}. Event with name ${maybeExisting.summary} already exists. (Name in the CSV: ${summary}).`
      );
      console.log("Not adding this. Keeping the old version");
      continue;
    }

    // `insert` method throws for error responses
    const result = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: { summary, description, location, ...time },
    });
    console.log(`Event created for ${event.dateTime}:`, result.data.htmlLink);
  }
}

async function run() {
  // dotenv preserves CLI arguments (in GitHub CI for instance). See `override` dotenv config prop
  dotenv.config();

  const events = await readEvents(
    process.argv[2] || "./veranstaltungen-lkg.csv"
  );
  await updateGoogleCalendar(events);
  console.log("Done");
}

run().catch(console.error);
