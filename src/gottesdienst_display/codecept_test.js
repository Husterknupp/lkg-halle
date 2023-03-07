const getNextSunday = require("./get_next_sunday.js").getNextSunday;
const dotenv = require("dotenv");

Feature("Gottesdienst Display");

Scenario("Login to admin area and update slider", async ({ I }) => {
  dotenv.config();

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
