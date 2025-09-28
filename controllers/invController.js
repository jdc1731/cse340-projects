const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)

  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
    const className = data[0].classification_name
    
    
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
      grid,
  })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */

invCont.buildByInvId = async function (req, res, next) {
    console.log('buildByInvId hit with', { invId: req.params.invId });
  try {
    const invId = Number.parseInt(req.params.invId, 10)

    //Validate the id 
    if (!Number.isInteger(invId)) {
      const err = new Error("Invalid vehicle id.")
      err.status = 400 
      return next(err) 
    }

    // Ask the MODEL for this one vehicle
    const vehicle = await invModel.getVehicleById(invId)

    
    if (!vehicle) {
      const err = new Error("Vehicle not found.")
      err.status = 404 
      return next(err)
    }

    //  Build pieces the view needs
    const nav = await utilities.getNav() 
    // buildVehicleDetail = UTILITY 
    const detail = await utilities.buildVehicleDetail(vehicle)

    // Title shown in <title> and <h1>: "YEAR MAKE MODEL"
    const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`

    // Render the VIEW 
    return res.render("inventory/detail", { title, nav, detail })
  } catch (e) {
    return next(e)
  }
}

// Intentional 500 error (for testing)
invCont.triggerServerError = async function (req, res, next) {
  const err = new Error("Intentional test error (500)");
  err.status = 500;
  throw err; 
};

module.exports = invCont