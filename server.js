/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

const baseController = require("./controllers/baseController")

const utilities = require('./utilities');

const path = require("path")

const cookieParser = require("cookie-parser")

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const session = require("express-session")
const pool = require("./database/")

const accountRoute = require("./routes/accountRoute");

const bodyParser = require("body-parser")

// ***********************
// Middleware
// *************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) 

app.use(cookieParser())
app.use(utilities.checkJWTToken)


// Express Message Middleware
app.use(require('connect-flash')())
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)
//Index Route
app.get("/", utilities.handleErrors(baseController.buildHome)) 
// Inventory routes
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute);

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "images", "site", "favicon-32x32.png"))
})

app.use(async (req, res, next) => {
  next({ status: 404, message: `Sorry, this page was snapped by Thanos` })
})

/* ***********************
 * Express Error Handler
 *Place after all other middleware
 *************************/

app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'We put the fun in dysfunction!'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
