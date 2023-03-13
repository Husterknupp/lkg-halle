// in this file you can append custom step methods to 'I' object

module.exports = function () {
  return actor({
    // Define custom steps here, use 'this' to access default methods of I.
    // It is recommended to place a general 'login' function here.

    amLoggedIn: async function () {
      this.amOnPage("/wp-login.php");
      this.fillField("Benutzername", process.env.USERNAME_WP_ADMIN);
      this.fillField("Passwort", secret(process.env.PASSWORD_WP_ADMIN));
      const source = await this.grabSource();
      console.log("######## DEBUG steps_file ########\n");
      console.log(source);
      console.log("\n######## DEBUG steps_file ########");
      this.click("Anmelden");
    },
  });
};
