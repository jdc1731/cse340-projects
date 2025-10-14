// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require('../utilities'); 
const invValidate = require("../utilities/inventory-validation") 

router.get("/", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));

router.get("/add-classification", utilities.checkLogin,
  utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));

router.post("/add-classification", utilities.checkLogin,
  utilities.checkAccountType, invValidate.classificationRules(), invValidate.checkClassificationData, utilities.handleErrors(invController.addClassification));

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));


// Route to build inventory detail view
router.get('/detail/:invId', utilities.handleErrors(invController.buildByInvId));

// Route to intentionally trigger a 500 error
router.get(
  "/error/boom",
  utilities.handleErrors(invController.triggerServerError)
);

router.get("/add-inventory", utilities.checkLogin,utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));

router.get("/getInventory/:classification_id", utilities.checkLogin,
  utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON))

router.post(
  "/add-inventory", utilities.checkLogin,
  utilities.checkAccountType, 
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

router.get("/edit/:inv_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventory));

router.post("/edit-inventory",
   utilities.checkLogin, utilities.checkAccountType, invValidate.inventoryRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory))

  // Route to delete inventory item
router.get("/delete/:inv_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteInventory));

router.post("/delete-inventory", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory));

router.get("/flash-test", (req, res) => {
  req.flash("notice", "Flash wiring works!");
  req.session.save(() => res.redirect("/inv/"));
});

module.exports = router;