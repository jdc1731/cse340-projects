// controllers/accountController.js
const utilities = require("../utilities");

async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav();  
  res.render("account/management", { title: "Account Management", nav });
}

module.exports = { buildAccountManagement };

