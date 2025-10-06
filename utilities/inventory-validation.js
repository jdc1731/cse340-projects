const { body, validationResult } = require("express-validator")
const utilities = require("./index")

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
 *  Check results or re-render form
 * ***************************************/
invValidate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const nav = await utilities.getNav()
  const { classification_name } = req.body
  return res.status(400).render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: errors.array(),    
    classification_name         
  })
}

module.exports = invValidate
