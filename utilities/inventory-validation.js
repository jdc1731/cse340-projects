// utilities/inventory-validation.js
const { body, validationResult } = require("express-validator")
const utilities = require(".") 

const invValidate = {}

/* **********************************
 *  Rules: Add Classification
 * **********************************/
invValidate.classificationRules = () => [
  body("classification_name")
    .trim()
    .notEmpty().withMessage("Classification name is required.")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Only letters and numbers allowed (no spaces or special characters).")
]

/* ****************************************
 *  Check results or re-render classification form
 * ***************************************/
invValidate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const nav = await utilities.getNav()
  return res.status(400).render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: errors.array(),
    classification_name: req.body.classification_name 
  })
}

/* **********************************
 *  Rules: Add Inventory
 * **********************************/
invValidate.inventoryRules = () => [
  body("classification_id")
    .trim()
    .notEmpty().withMessage("Please choose a classification.")
    .isInt({ min: 1 }).withMessage("Invalid classification."),

  body("inv_make")
    .trim()
    .notEmpty().withMessage("Make is required."),

  body("inv_model")
    .trim()
    .notEmpty().withMessage("Model is required."),

  body("inv_year")
    .trim()
    .matches(/^\d{4}$/).withMessage("Year must be a 4-digit number (e.g., 2019)."),

  body("inv_price")
    .trim()
    .notEmpty().withMessage("Price is required.")
    .isInt({ min: 0 }).withMessage("Price must be a whole number ≥ 0."),

  body("inv_miles")
    .trim()
    .notEmpty().withMessage("Miles is required.")
    .isInt({ min: 0 }).withMessage("Miles must be a whole number ≥ 0."),

  body("inv_color")
    .trim()
    .notEmpty().withMessage("Color is required."),

  body("inv_image")
    .trim()
    .notEmpty().withMessage("Image path is required."),

  body("inv_thumbnail")
    .trim()
    .notEmpty().withMessage("Thumbnail path is required."),
]

/* ****************************************
 *  Check results or re-render inventory form
 * ***************************************/
invValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)

  return res.status(400).render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: errors.array(),

    inv_make: req.body.inv_make,
    inv_model: req.body.inv_model,
    inv_year: req.body.inv_year,
    inv_description: req.body.inv_description,
    inv_image: req.body.inv_image,
    inv_thumbnail: req.body.inv_thumbnail,
    inv_price: req.body.inv_price,
    inv_miles: req.body.inv_miles,
    inv_color: req.body.inv_color,
    classification_id: req.body.classification_id,
  })
}

/* ****************************************
 *  Errors will be directed to the edit view
 * ***************************************/
invValidate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)

  return res.status(400).render("inventory/edit-inventory", {
    title: `Edit ${req.body.inv_year} ${req.body.inv_make} ${req.body.inv_model}`,
    nav,
    classificationList,            
    errors: errors.array(),

    inv_id: req.body.inv_id,
    inv_make: req.body.inv_make,
    inv_model: req.body.inv_model,
    inv_year: req.body.inv_year,
    inv_description: req.body.inv_description,
    inv_image: req.body.inv_image,
    inv_thumbnail: req.body.inv_thumbnail,
    inv_price: req.body.inv_price,
    inv_miles: req.body.inv_miles,
    inv_color: req.body.inv_color,
    classification_id: req.body.classification_id,
  })
}


module.exports = invValidate

