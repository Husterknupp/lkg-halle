import { readFileSync } from "fs";
import neatCsv from "neat-csv";

export async function readEvents(fileName) {
  // https://github.com/mafintosh/csv-parser#api
  const events = await neatCsv(readFileSync(fileName, { encoding: "utf-8" }), {
    separator: ";",
  });
  console.log(`Found ${events.length} events in ${fileName}`);
  return events;
}
