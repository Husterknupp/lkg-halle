const GoogleCalendar = require("./google_calendar.js");
const createDateFormatter = require("intl-dateformat").createDateFormatter;

Feature("Gottesdienst Display");

async function getNextSunday() {
  const daysUntilSunday = 7 - new Date().getDay();
  const nextSunday = new Date();
  nextSunday.setUTCDate(nextSunday.getDate() + daysUntilSunday);
  console.log(`next Sunday: ${nextSunday}`);

  const monthFormatted = String(nextSunday.getUTCMonth() + 1).padStart(2, "0");
  const dayFormatted = String(nextSunday.getUTCDate()).padStart(2, "0");
  const maybeResult = (await GoogleCalendar.getEvents()).find((event) => {
    //  full-day events are not relevant  (also, they have no `dateTime`)
    if (!event.start.dateTime) return false;

    // format of start.dateTime: 2019-10-12T07:20:50.52Z
    return (
      event.start.dateTime.indexOf(`-${monthFormatted}-${dayFormatted}`) !== -1
    );
  });

  if (!maybeResult) throw new Error(`No service on ${dateString}`);

  const dateFormat = createDateFormatter({
    D: ({ day }) => (day[0] === "0" ? day[1] : day),
  });

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

Scenario("Login to admin area and update slider", async ({ I }) => {
  const [newTitle, newDescription] = await getNextSunday();

  // login happens in steps_file
  I.amLoggedIn();

  I.amOnPage(process.env.WP_SLIDER_URL);

  const oldTitle = await I.grabValueFrom("input[name=slide_title_field]");
  console.log(`replace old title *${oldTitle}* with new version *${newTitle}*`);
  I.fillField("slide_title_field", newTitle);

  const oldDescription = await I.grabTextFrom("#slide_text_field");
  console.log(
    `replace old description *${oldDescription}* with new version *${newDescription}*`
  );
  I.fillField("slide_text_field", newDescription);

  I.click("Aktualisieren");
});
