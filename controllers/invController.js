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

//  Add Classification form submission (POST)
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const nav = await utilities.getNav()

  if (!classification_name || !classification_name.trim()) {
    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: [{ msg: "Please provide a classification name." }],
      classification_name
    })
  }

  // Ask the MODEL to insert 
  const result = await invModel.addClassification(classification_name.trim())

  if (result && result.rowCount === 1) {
    req.flash("notice", `Added classification: ${classification_name.trim()}`)
    const freshNav = await utilities.getNav() 
    return res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav: freshNav
    })
  }

  // Insert failed, re-render form with error and sticky value
  return res.status(400).render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: [{ msg: "Insert failed. Please try again." }],
    classification_name
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
    // buildVehicleDetail  
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

// Build management view
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(); 
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect, 
    });
  } catch (err) {
    next(err);
  }
};

  
invCont.buildAddClassification = async function (req, res, next) {
    const nav = await utilities.getNav();  
  res.render("inventory/add-classification", {
    title: "Add Classification", nav,
    errors: null,
    classification_name: ""
     });
}

// Build "Add Inventory" view 
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList() 

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,

      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      classification_id: ""
    })
  } catch (err) {
    return next(err)
  }
}

invCont.addInventory = async function (req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body


    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })

    if (result && result.rowCount === 1) {
      req.flash("notice", `${inv_year} ${inv_make} ${inv_model} added.`)
      const nav = await utilities.getNav()
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
      })
    }


    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: [{ msg: "Insert failed. Please try again." }],

      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  } catch (err) {
    return next(err)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

// **************************************
// Build Edit Inventory view
// controllers/invController.js

invCont.buildEditInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id, 10)
    if (!Number.isInteger(inv_id)) {
      const err = new Error("Invalid vehicle id")
      err.status = 400
      return next(err)
    }

    const vehicle = await invModel.getVehicleById(inv_id)
    if (!vehicle) {
      const err = new Error("Vehicle not found")
      err.status = 404
      return next(err)
    }

    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(vehicle.classification_id)

    return res.render("inventory/edit-inventory", {
      title: `Edit ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      classificationList,
      errors: null,

      // sticky values pre-filled from DB
      inv_id: vehicle.inv_id,
      inv_make: vehicle.inv_make,
      inv_model: vehicle.inv_model,
      inv_year: vehicle.inv_year,
      inv_description: vehicle.inv_description,
      inv_image: vehicle.inv_image,
      inv_thumbnail: vehicle.inv_thumbnail,
      inv_price: vehicle.inv_price,
      inv_miles: vehicle.inv_miles,
      inv_color: vehicle.inv_color,
      classification_id: vehicle.classification_id,
    })
  } catch (err) {
    return next(err)
  }
}


module.exports = invCont