const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc"); // timezone plugin depends on it
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

async function updateGoogleCalendar(events, calendar) {
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

    let slicedSummary = summary.slice(0, 12);
    if (slicedSummary.length < summary.length) {
      slicedSummary += "...";
    }
    console.log(
      `Event "${slicedSummary}" created for ${event.dateTime} -- ID: ${result.data.id} -- Link: ${result.data.htmlLink}`
    );
  }
}

function getDescription(event, summary) {
  if (summary.toLowerCase().indexOf("gottesdienst") !== -1) {
    const description = [];
    if (event.preaching !== "") {
      description.push(`Predigt: ${event.preaching}`);
    }
    if (event.moderator !== "") {
      description.push(`Moderation: ${event.moderator}`);
    }
    return description.join(" • ");
  } else if (summary.toLowerCase().indexOf("bibelgespräch") !== -1) {
    return `Leitung: ${event.preaching}`;
  } else {
    return "";
  }
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
      timeMin: time.start.dateTime,
      timeMax: time.end.dateTime,
      timezone: TZ_BERLIN,
      maxResults: 10, // Increase to check for multiple events
      singleEvents: true,
      orderBy: "startTime",
    })
  ).data.items;

  if (!maybeExisting || maybeExisting.length === 0) {
    return false;
  }

  for (const existingEvent of maybeExisting) {
    console.log(
      `Checking against existing event: ${existingEvent.summary} (${existingEvent.start.dateTime} - ${existingEvent.end.dateTime})`
    );
    if (
      newEventSummary.toLocaleLowerCase() ===
      existingEvent.summary.toLocaleLowerCase()
    ) {
      console.log(
        `I see two events with the same name on the same day: Event '${existingEvent.summary}' is already in the calendar (from ${existingEvent.start.dateTime} to ${existingEvent.end.dateTime}). Not adding it a second time.`
      );
      return true;
    }
  }

  return false;
}

module.exports = {
  updateGoogleCalendar,
};
