Feature("Gottesdienst Display");

// todo get next Sunday's info from file or so
// FILE SYSTEM
// const fs = require("fs");
// * https://codecept.io/configuration/
// * https://github.com/codecept-js/CodeceptJS/blob/master/docs/helpers/FileSystem.md
// * relative from root path of repo, don't write `~/code/ausprobieren/lkg-halle/package.json`, only `package.json` in this case

Scenario("Login to admin area and update slider", async ({ I }) => {
  // login happens in steps_file
  I.amLoggedIn();

  I.amOnPage("/wp-admin/post.php?post=284&action=edit");

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
