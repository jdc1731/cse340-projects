// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

/**
 * ADMIN-ONLY 
 */
router.get("/", utilities.requireEmployeeOrAdmin, utilities.handleErrors(invController.buildManagement))

router.get("/add-classification", utilities.requireEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassification))

router.post("/add-classification", utilities.requireEmployeeOrAdmin, invValidate.classificationRules(), invValidate.checkClassificationData, utilities.handleErrors(invController.addClassification))

router.get("/add-inventory", utilities.requireEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventory))

router.post(
  "/add-inventory",
  utilities.requireEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

router.get("/getInventory/:classification_id", utilities.requireEmployeeOrAdmin, utilities.handleErrors(invController.getInventoryJSON))

router.get("/edit/:inv_id", utilities.requireEmployeeOrAdmin, utilities.handleErrors(invController.buildEditInventory))

router.post("/edit-inventory", utilities.requireEmployeeOrAdmin, invValidate.inventoryRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory))

router.get("/delete/:inv_id", utilities.requireEmployeeOrAdmin, utilities.handleErrors(invController.buildDeleteInventory))

router.post("/delete-inventory",   utilities.requireEmployeeOrAdmin, utilities.handleErrors(invController.deleteInventory))

/**
 * Classification list & vehicle detail must be visible to visitors.
 */
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

router.get("/detail/:invId",          utilities.handleErrors(invController.buildByInvId))

/**
 * Utilities / test route 
 */
router.get("/error/boom", utilities.handleErrors(invController.triggerServerError))

router.get("/flash-test", (req, res) => {
  req.flash("notice", "Flash wiring works!")
  req.session.save(() => res.redirect("/inv/"))
})

module.exports = router
