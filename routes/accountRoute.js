const express = require("express")
const router = new express.Router()

const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation") // use one name

// GET /account/  -> Account Management
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// GET /account/login  -> Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// GET /account/register 
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// POST /account/register 
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// POST /account/login 
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin) 
)

module.exports = router
