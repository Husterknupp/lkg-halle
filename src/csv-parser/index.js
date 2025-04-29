const { createReadStream } = require("fs");
const csv = require("csv-parser");

async function readEvents(fileName) {
  if (!fileName) {
    throw Error("Missing csv file argument (file path)");
  } else {
    console.log(`Reading events from file ${fileName}`);
  }

  // const encoding = "latin1";
  const encoding = "utf-8";

  const rows = await parseCsv(fileName, encoding, ";");
  console.log(`Found ${rows.length} event(s)\n`);
  return rows.map((e) => sanitize(e));
}

async function parseCsv(fileName, encoding, separator) {
  const result = [];
  await new Promise((resolve) => {
    createReadStream(fileName, { encoding })
      .pipe(
        // https://github.com/mafintosh/csv-parser#api
        csv({ separator })
      )
      .on("data", (event) => result.push(event))
      .on("error", console.error)
      .on("end", resolve);
  });
  return result;
}

function sanitize(event) {
  if (JSON.stringify(event).indexOf("�") !== -1) {
    throw new Error(
      `Found funny character � in event with name ${event.name}\nWrong encoding?`
    );
  }

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

  return event;
}

module.exports = { readEvents };
