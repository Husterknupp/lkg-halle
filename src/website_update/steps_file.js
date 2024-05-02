// in this file you can append custom step methods to 'I' object
module.exports = function () {
  return actor({
    // Define custom steps here, use 'this' to access default methods of I.
    // It is recommended to place a general 'login' function here.

    amLoggedIn: async function () {
      this.amOnPage("/wp-login.php");
      this.fillField(
        "Benutzername oder E-Mail-Adresse",
        process.env.USERNAME_WP_ADMIN,
      );
      this.fillField("Passwort", secret(process.env.PASSWORD_WP_ADMIN));

      await this.usePlaywrightTo(
        "fix broken page navigation",
        async (Playwright) => {
          const timeoutConfig = { timeout: 30000 };
          console.log(
            `Anmelden button needs some waiting time...`,
            timeoutConfig,
          );
          const button = await Playwright.page.getByText("Anmelden");
          // This button click is weird. After click, Playwright waits for navigations to succeed.
          //   When I click the button locally, after <5s I can see the next page.
          // However, less waiting time (default: 5s) breaks and the click we be tried a few times before it will fail.
          // https://playwright.dev/docs/api/class-locator#locator-click-option-timeout
          await button.click(timeoutConfig);
          console.log(`...done waiting.`);
        },
      );
    },
  });
};
