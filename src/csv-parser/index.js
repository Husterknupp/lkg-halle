const { createReadStream } = require("fs");
const csv = require("csv-parser");

async function readEvents(fileName) {
  if (!fileName) {
    throw Error("Missing csv file argument (file path)");
  } else {
    console.log("Reading events from file " + fileName);
  }

  const events = [];
  await new Promise((resolve) => {
    // Streaming the CSV file because csv-parser operates on streams
    createReadStream(fileName)
      .pipe(
        // https://github.com/mafintosh/csv-parser#api
        csv({
          separator: ";",
        })
      )
      .on("data", (event) => {
        // No control over imported CSV - it sometimes comes with a funny space character
        if (event["﻿name"]) {
          event.name = event["﻿name"];
        }
        if (!event.name) {
          return;
        }

        if (event.isStreamable === "1") {
          event.isStreamable = true;
        } else {
          event.isStreamable = false;
        }

        events.push(event);
      })
      .on("error", console.error)
      .on("end", resolve);
  });

  console.log(`Found ${events.length} events`);
  return events;
}

module.exports = { readEvents };
