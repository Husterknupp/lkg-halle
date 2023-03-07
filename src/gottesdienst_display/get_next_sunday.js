const GoogleCalendar = require("./google_calendar.js");
const createDateFormatter = require("intl-dateformat").createDateFormatter;

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

  // todo instead of 2-level hierarchy (test -> this -> `GoogleCalender`),
  //   invert control and pass down events from caller
  const maybeResult = (await GoogleCalendar.getEvents()).find((event) => {
    //  full-day events are not relevant  (also, they have no `dateTime`)
    if (!event.start.dateTime) return false;

    // format of start.dateTime: 2019-10-12T07:20:50.52Z
    return event.start.dateTime.indexOf(simpleDateFormat(nextSunday)) !== -1;
  });

  if (!maybeResult) {
    throw new Error(`No service on ${simpleDateFormat(nextSunday)}`);
  } else {
    console.log(
      `event found: [${maybeResult.summary}] on [${maybeResult.start.dateTime}]`
    );
  }

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
    { locale: "de-DE" }
  )} in der Ludwig-Stur-Str. 5`;

  return [title, description];
}

module.exports = { getNextSunday };
