const { createCalendarClient } = require("../google-calendar");
const createDateFormatter = require("intl-dateformat").createDateFormatter;

async function getCalendarEvents() {
  const calendar = await createCalendarClient();

  const response = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    timeMin: new Date().toISOString(),
  });

  console.log(`found ${(response.data.items || []).length} items`);
  return response.data.items;
}

function simpleDateFormat(date) {
  const monthFormatted = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dayFormatted = String(date.getUTCDate()).padStart(2, "0");

  return `${date.getUTCFullYear()}-${monthFormatted}-${dayFormatted}`;
}

const dateFormat = createDateFormatter({
  D: ({ day }) => (day[0] === "0" ? day[1] : day),
  MMMM: ({ month }) => {
    switch (month) {
      case "01":
        return "Januar";
      case "02":
        return "Februar";
      case "03":
        return "März";
      case "04":
        return "April";
      case "05":
        return "Mai";
      case "06":
        return "Juni";
      case "07":
        return "Juli";
      case "08":
        return "August";
      case "09":
        return "September";
      case "10":
        return "Oktober";
      case "11":
        return "November";
      case "12":
        return "Dezember";
    }
  },
});

async function getNextSunday() {
  const daysUntilSunday = 7 - new Date().getDay();
  const nextSunday = new Date();
  nextSunday.setUTCDate(nextSunday.getDate() + daysUntilSunday);
  console.log(`next Sunday: ${nextSunday}`);

  const allEvents = await getCalendarEvents();
  const nextSundayDateStr = simpleDateFormat(nextSunday);

  // Filter all events for the target date
  const eventsOnDate = allEvents.filter((event) => {
    //  full-day events are not relevant  (also, they have no `dateTime`)
    if (!event.start.dateTime) return false;

    // format of start.dateTime: 2019-10-12T07:20:50.52Z
    return event.start.dateTime.indexOf(nextSundayDateStr) !== -1;
  });

  if (eventsOnDate.length === 0) {
    throw new Error(
      `Found no church service in calendar for date ${nextSundayDateStr}`,
    );
  }

  // Prefer "Gottesdienst" events, otherwise pick the first event of the day
  let maybeResult = eventsOnDate.find((event) =>
    event.summary.toLowerCase().includes("gottesdienst"),
  );

  if (!maybeResult) {
    maybeResult = eventsOnDate[0];
  }

  console.log(
    `event found: [${maybeResult.summary}] on [${maybeResult.start.dateTime}]`,
  );

  // node only supports english locale (`toLocaleDateString` vs `dateFormat`)
  const title =
    (maybeResult.summary.toLowerCase().indexOf("abendmahl") !== -1
      ? "Gottesdienst mit Abendmahl"
      : "Gottesdienst") +
    ` um ${dateFormat(new Date(maybeResult.start.dateTime), "HH", {
      timezone: "Europe/Berlin",
      locale: "de-DE",
    })} Uhr`;

  const description = `am ${dateFormat(
    new Date(maybeResult.start.dateTime),
    "D. MMMM",
    { locale: "de-DE" },
  )} in der Ludwig-Stur-Str. 5`;

  return [title, description];
}

module.exports = { getNextSunday };
