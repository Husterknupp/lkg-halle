// in this file you can append custom step methods to 'I' object

module.exports = function() {
    return actor({
        // Define custom steps here, use 'this' to access default methods of I.
        // It is recommended to place a general 'login' function here.

        amLoggedIn: function() {
            this.amOnPage('/wp-login.php');
            this.fillField('Benutzername', process.env.LKG_USERNAME);
            this.fillField('Passwort', secret(process.env.LKG_PASSWORD));
            this.click('Anmelden');
        },
    });
};
