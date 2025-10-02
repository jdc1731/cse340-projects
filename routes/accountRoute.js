const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router()

const utilities = require('../utilities'); 

const accountController = require("../controllers/accountController");
const validate = require('../utilities/account-validation');

router.get("/", utilities.handleErrors(accountController.buildLogin));
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    validate.loginRules(),
    validate.checkLoginData,
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router;