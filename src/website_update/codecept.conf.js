exports.config = {
  noGlobals: true,
  tests: "./index.mjs",
  output: "../../output",
  helpers: {
    Playwright: {
      url: "https://lkg-halle.de",
      // headless mode when running with HEADLESS=true environment variable
      show: !process.env.HEADLESS,
      browser: "chromium",
    },
  },
  include: {
    I: "./steps_file.mjs",
  },
  bootstrap: null,
  mocha: {},
  name: "lkg-halle",
  plugins: {
    pause: {},
    retryFailedStep: {
      enabled: true,
    },
    screenshot: {
      enabled: true,
    },
  },
};
