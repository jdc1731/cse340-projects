// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require('../utilities');  

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));


// Route to build inventory detail view
router.get('/detail/:invId', utilities.handleErrors(invController.buildByInvId));

// Route to intentionally trigger a 500 error
router.get(
  "/error/boom",
  utilities.handleErrors(invController.triggerServerError)
);


module.exports = router;