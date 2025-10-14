
// controllers/accountController.js
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  process registration 
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Registration failed: The form encountered an existential crisis.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav()
    return res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null
    })
  } catch (err) {
    return next(err)
  }
}

async function buildLogin(req, res) {
    const nav = await utilities.getNav();  
    res.render("account/login", { title: "Login", nav });
}
  

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Registration",
        nav,
        errors: null,
    })
}
  
/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

// controllers/accountController.js (inside exports.login)
// req.session.loggedin = true;
// req.session.accountData = {
//   account_id: user.account_id,
//   account_firstname: user.account_firstname,
//   account_lastname: user.account_lastname,
//   account_email: user.account_email,
//   account_type: user.account_type 
// };
// req.session.save(() => res.redirect('/account')); 

module.exports = { buildAccountManagement, buildLogin, buildRegister, registerAccount, accountLogin };

