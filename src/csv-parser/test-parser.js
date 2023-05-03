const { readEvents } = require("./index.js");

async function run() {
  await readEvents(process.argv[2]);
  console.log("Done.");
}

run().catch(console.error);
