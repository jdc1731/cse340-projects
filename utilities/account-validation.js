const utilities = require(".");
const { body, validationResult } = require('express-validator');
const accountModel = require("../models/account-model");
const validate = {};

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), 
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."),
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
            .withMessage("Password does not meet requirements."),
      
      // valid email is required and cannot already exist in the database
        body("account_email")
            .isEmail().withMessage("A valid email is required.")
            .normalizeEmail() // refer to validator.js docs
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists){
                    throw new Error("Email exists. Please log in or use different email")
                }
                return true
            }),
    ]
}
    
    // --- Login validation rules ---
validate.loginRules = () => [
  body("account_email")
    .trim()
    .isEmail().withMessage("Please enter a valid email address.")
    .normalizeEmail(),
  body("account_password")
    .trim()
    .notEmpty().withMessage("Password is required."),
    ]

    // --- Handle login validation errors ---
validate.checkLoginData = async (req, res, next) => {
  const result = validationResult(req)
  if (result.isEmpty()) return next()

  const nav = await utilities.getNav()
  return res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: result.array(),            // array of {msg, param,...}
    account_email: req.body.account_email, // sticky email
  })
}

  
/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* =========================================
 *Update Account & Change Password
 * ========================================= */

/* Rules for updating first name, last name, email */
validate.updateInfoRules = () => {
  return [
    body("account_id")
      .trim()
      .isInt().withMessage("Invalid account id."),

    body("account_firstname")
      .trim()
      .notEmpty().withMessage("First name is required."),

    body("account_lastname")
      .trim()
      .notEmpty().withMessage("Last name is required."),

    body("account_email")
      .trim()
      .isEmail().withMessage("A valid email is required.")
      .normalizeEmail()
      .custom(async (value, { req }) => {
        // Allow keeping the same email; only block if the email belongs to another account
        const acct = await accountModel.getAccountByEmail(value);
        if (acct && Number(acct.account_id) !== Number(req.body.account_id)) {
          throw new Error("That email is already in use.");
        }
        return true;
      }),
  ];
};

/* If update-info validation fails, re-render the update view with sticky values */
validate.checkUpdateInfoData = async (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const nav = await utilities.getNav();

  return res.status(400).render("account/update", {
    title: "Update Account",
    nav,
    errors: result.array(),
   
    account_id: req.body.account_id,
    account_firstname: req.body.account_firstname,
    account_lastname: req.body.account_lastname,
    account_email: req.body.account_email,
  });
};

/* Rules for changing password */
validate.passwordRules = () => {
  return [
    body("account_id")
      .trim()
      .isInt().withMessage("Invalid account id."),
    body("account_password")
      .isString()
      .isLength({ min: 12 }).withMessage("Password must be at least 12 characters.")
      .matches(/[a-z]/).withMessage("Password must include a lowercase letter.")
      .matches(/[A-Z]/).withMessage("Password must include an uppercase letter.")
      .matches(/\d/).withMessage("Password must include a number.")
      .matches(/\W/).withMessage("Password must include a symbol."),
  ];
};

/* If password validation fails, re-render the update view with sticky values */
validate.checkPasswordData = async (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const nav = await utilities.getNav();

  return res.status(400).render("account/update", {
    title: "Update Account",
    nav,
    errors: result.array(),
    // keep the id; prefill name/email 
    account_id: req.body.account_id,
    account_firstname: res.locals.accountData?.account_firstname || "",
    account_lastname:  res.locals.accountData?.account_lastname  || "",
    account_email:     res.locals.accountData?.account_email     || "",
  });
};


module.exports = validate