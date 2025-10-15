
// controllers/accountController.js
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  process registration 
* *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    return res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Registration failed: The form encountered an existential crisis.");
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res) {
  const nav = await utilities.getNav();
    return res.render("account/login", {
        title: "Login", nav,
        errors: [], 
      account_email: "",
   });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res) {
  const nav = await utilities.getNav();
  return res.render("account/register", {
    title: "Registration",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    return res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData: res.locals.accountData || null,
    });
  } catch (err) {
    return next(err);
  }
}

/* ****************************************
*  Process login request (JWT + cookie)
* *************************************** */
async function accountLogin(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  const user = await accountModel.getAccountByEmail(account_email);
  if (!user) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "Incorrect email or password." }],
      account_email,
    });
  }

  try {
    const ok = await bcrypt.compare(account_password, user.account_password);
    if (!ok) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Incorrect email or password." }],
        account_email,
      });
    }

  
    const payload = {
      account_id: user.account_id,
      account_firstname: user.account_firstname,
      account_lastname: user.account_lastname,
      account_email: user.account_email,
      account_type: user.account_type,
    };

   
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2h" });
    res.cookie("jwt", token, { httpOnly: true });
    return res.redirect("/account");

  } catch (error) {
    console.error("Login error:", error);
    req.flash("notice", "Access forbidden. Please try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "Login failed. Please try again." }],
      account_email,
    });
  }
}

/* ****************************************
*  Logout (simple)
* *************************************** */
function logout(req, res) {
  res.clearCookie("jwt"); 
  return res.redirect("/");
}

// *****************************************
//  deliver Update Account View
// *****************************************
async function buildUpdateAccount(req, res, next) {
    try {
        const nav = await utilities.getNav();
        const user = res.locals.accountData || {}
        const paramId = parseInt(req.params.account_id, 10)
        if (!Number.isInteger(paramId) || user.account_id !== paramId) {
            return res.redirect("/account")
        }
        return res.render("account/update", {
            title: "Update Account",
            nav,
            errors: null,

            account_id: user.account_id,
            account_firstname: user.account_firstname,
            account_lastname: user.account_lastname,
            account_email: user.account_email,
        });
    } catch (err) {
        return next(err);
    }
}

/* **************************************
 * POST: Update first name, last name, email
 * ************************************** */
async function updateAccountInfo(req, res, next) {
    console.log("[updateAccountInfo] body:", req.body);
  try {

    const nav = await utilities.getNav();

    const { account_id, account_firstname, account_lastname, account_email } = req.body;

    // Ask the MODEL to update the row
    const result = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
      );
      
      console.log("[updateAccountInfo] db result:", {
      rowCount: result && result.rowCount,
      rows: result && result.rows ? result.rows.length : null
    });


    if (result && result.rowCount === 1) {
  
        const fresh = await accountModel.getAccountById(account_id);
        console.log("[updateAccountInfo] fresh:", fresh);

      // Re-issue JWT so header shows the new name/email
      const payload = {
        account_id: fresh.account_id,
        account_firstname: fresh.account_firstname,
        account_lastname: fresh.account_lastname,
        account_email: fresh.account_email,
        account_type: fresh.account_type,
      };
      const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2h" });
      res.cookie("jwt", token, { httpOnly: true });

      //  Deliver the management view with UPDATED data
      return res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        accountData: fresh,
      });
    }

    req.flash("notice", "Update failed. Please try again.");
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: [{ msg: "Update failed. Please try again." }],
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
  } catch (err) {
      console.error("[updateAccountInfo] ERROR:", err);
    return next(err);
  }
}

/* **************************************
 *  Change password 
 * ************************************** */
async function updatePassword(req, res, next) {
    console.log("[updatePassword] body:", req.body);
  try {

    const nav = await utilities.getNav();


    const { account_id, account_password } = req.body;

      const hash = await bcrypt.hash(account_password, 10);
      console.log("[updatePassword] hash created");

      const result = await accountModel.updateAccountPassword(account_id, hash);
      console.log("[updatePassword] db result:", {
      rowCount: result && result.rowCount,
      rows: result && result.rows ? result.rows.length : null
    });

    if (result && result.rowCount === 1) {
        const fresh = await accountModel.getAccountById(account_id);
        console.log("[updatePassword] fresh:", fresh);
      req.flash("notice", "Password updated.");
      return res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        accountData: fresh,
      });
    }

    req.flash("notice", "Password update failed. Please try again.");
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: [{ msg: "Password update failed. Please try again." }],
      account_id,
      account_firstname: res.locals.accountData?.account_firstname || "",
      account_lastname:  res.locals.accountData?.account_lastname  || "",
      account_email:     res.locals.accountData?.account_email     || "",
    });
  } catch (err) {
       console.error("[updatePassword] ERROR:", err);
    return next(err);
  }
}

function logout(req, res) {
  res.clearCookie("jwt"); 
  return res.redirect("/");
}



module.exports = {
  buildAccountManagement,
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  logout, buildUpdateAccount, updateAccountInfo, updatePassword
};

