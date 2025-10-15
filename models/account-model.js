
const pool = require("../database/")
const accountModel = require("../models/account-model")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}


/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* Get account by id (used after updates to show fresh data) */
async function getAccountById(account_id) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname,
           account_email, account_type
    FROM account
    WHERE account_id = $1
  `
  const result = await pool.query(sql, [Number(account_id)])
  return result.rows[0] || null
}

/* Update first name, last name, email */
async function updateAccountInfo(account_id, firstname, lastname, email) {
  const sql = `
    UPDATE account
       SET account_firstname = $2,
           account_lastname  = $3,
           account_email     = $4
     WHERE account_id = $1
     RETURNING account_id
  `
  // Return the full pg result so controller can check result.rowCount
  return pool.query(sql, [Number(account_id), firstname, lastname, email])
}

/* Update password (hash already computed in controller) */
async function updateAccountPassword(account_id, passwordHash) {
  const sql = `
    UPDATE account
       SET account_password = $2
     WHERE account_id = $1
     RETURNING account_id
  `
  // Return the full pg result so controller can check result.rowCount
  return pool.query(sql, [Number(account_id), passwordHash])
}


module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,          
  updateAccountInfo,
  updateAccountPassword,
}