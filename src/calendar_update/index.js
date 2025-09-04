const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { createCalendarClient } = require("../google-calendar");
const { readEvents } = require("../csv-parser");
const { updateGoogleCalendar } = require("./calendarEventHandling");

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

  await updateGoogleCalendar(events, await createCalendarClient());
  console.log(
    "Done. All events have been successfully updated in Google Calendar."
  );
}

function getAlphabeticallyLastFileName(directory) {
  const files = fs.readdirSync(directory);
  const sortedFiles = files.sort((a, b) => b.localeCompare(a));
  return path.join(directory, sortedFiles[0]);
}

module.exports = {
  updateGoogleCalendar,
};

run().catch(console.error);
