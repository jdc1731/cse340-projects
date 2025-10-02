const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router()

const utilities = require('../utilities'); 

const accountController = require("../controllers/accountController")

router.get("/", utilities.handleErrors(accountController.buildLogin));
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

module.exports = router;