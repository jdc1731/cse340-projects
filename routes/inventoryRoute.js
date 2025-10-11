// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require('../utilities'); 
const invValidate = require("../utilities/inventory-validation") 

router.get("/", utilities.handleErrors(invController.buildManagement));

router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

router.post("/add-classification", invValidate.classificationRules(), invValidate.checkClassificationData, utilities.handleErrors(invController.addClassification));

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));


// Route to build inventory detail view
router.get('/detail/:invId', utilities.handleErrors(invController.buildByInvId));

// Route to intentionally trigger a 500 error
router.get(
  "/error/boom",
  utilities.handleErrors(invController.triggerServerError)
);

router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

router.get("/edit/:inv_id", utilities.handleErrors(invController.buildEditInventory));

router.post("/edit-inventory",
  invValidate.inventoryRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory))

module.exports = router;