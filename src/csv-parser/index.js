const { createReadStream } = require("fs");
const csv = require("csv-parser");

function sanitizeAndAdd(event, result) {
  // No control over imported CSV - Excel on Windows may export it with a funny space character
  // noinspection JSNonASCIINames
  if (event["﻿name"]) {
    // noinspection JSNonASCIINames
    event.name = event["﻿name"];
  }
  if (!event.name) {
    return;
  }

  // Excel boolean representation
  event.isStreamable = event.isStreamable === "1";

  if (String(event.preaching) === "0") {
    event.preaching = "";
  }
  if (String(event.moderator) === "0") {
    event.moderator = "";
  }

  result.push(event);
}

async function readEvents(fileName) {
  if (!fileName) {
    throw Error("Missing csv file argument (file path)");
  } else {
    console.log("Reading events from file " + fileName);
  }

  const events = [];
  await new Promise((resolve) => {
    // todo detect encoding (latin-1 or utf-8) based on this funny character
    // �

    // Streaming the CSV file because csv-parser operates on streams
    createReadStream(fileName, { encoding: "utf-8" })
      .pipe(
        // https://github.com/mafintosh/csv-parser#api
        csv({
          separator: ";",
        })
      )
      .on("data", (event) => sanitizeAndAdd(event, events))
      .on("error", console.error)
      .on("end", resolve);
  });

  console.log(`Found ${events.length} events`);
  return events;
}

module.exports = { readEvents };
