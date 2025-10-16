const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const nav = await utilities.getNav()

  if (!Array.isArray(data) || data.length === 0) {
    return res.render("inventory/classification", {
      title: "No vehicles found",
      nav,
      grid: "<p>No vehicles in this classification.</p>",
    })
  }

  const grid = await utilities.buildClassificationGrid(data)
  const className = data[0].classification_name
  return res.render("inventory/classification", {
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
req.flash("success", `Added classification: ${classification_name.trim()}`)
return req.session.save(() => res.redirect("/inv"))

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
    console.log("peek flash at /inv:", req.session && req.session.flash)

    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(); 

    const classes = (await invModel.getClassifications()).rows;

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      classes,
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
req.flash("success", `${inv_year} ${inv_make} ${inv_model} added.`)
return req.session.save(() => res.redirect("/inv"))

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
  const classification_id = parseInt(req.params.classification_id, 10)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (Array.isArray(invData) && invData.length > 0) {
    return res.json(invData)
  }
    next(new Error("No data returned"))
  }


// **************************************
// Build Edit Inventory view
// **************************************
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
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/inv")
    }

    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(vehicle.classification_id)

    return res.render("inventory/edit-inventory", {
      title: `Edit ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      classificationList,
      errors: [],

      // sticky fields
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

// Process Update Inventory

invCont.updateInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();

    let {
      classification_id,
      inv_id,
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

    inv_id = Number.parseInt(inv_id, 10)
    classification_id = Number.parseInt(classification_id, 10)

    if (!Number.isInteger(inv_id)) {
      req.flash("notice", "Invalid vehicle id for update.")
      return res.redirect("/inv")
    }

    const result = await invModel.updateInventory({
      inv_id,
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

    // Accept common success shapes
    const ok =
      (result && typeof result.rowCount === "number" && result.rowCount >= 1) ||
      (result && Array.isArray(result.rows) && result.rows.length >= 1) ||
      (result && result.inv_id) ||
      result === true

    if (ok) {
req.flash("success", `The ${inv_year} ${inv_make} ${inv_model} was successfully updated.`)
return req.session.save(() => res.redirect("/inv"))

    }

    // Rebuild select & re-render with error
    const classificationList = await utilities.buildClassificationList(classification_id)
    return res.status(400).render("inventory/edit-inventory", {
      title: `Edit ${inv_year} ${inv_make} ${inv_model}`,
      nav,
      classificationList,
      errors: [{ msg: "Update failed. Please try again." }],
      inv_id,
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



// **************************************
// Build Delete Confirmation view
// **************************************
invCont.buildDeleteInventory = async function (req, res, next) {
  try {
    const inv_id = Number.parseInt(req.params.inv_id, 10)
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

    return res.render("inventory/delete-confirm", {
      title: `Delete ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      errors: null,

      inv_id: vehicle.inv_id,
      inv_make: vehicle.inv_make,
      inv_model: vehicle.inv_model,
      inv_year: vehicle.inv_year,
      inv_price: vehicle.inv_price,
    })
  } catch (err) {
    return next(err)
  }
}

// **************************************
// Delete Inventory item
// **************************************

invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id, 10);
    if (!Number.isInteger(inv_id)) {
      req.flash("notice", "Invalid vehicle id.");
      return res.redirect("/inv");
    }

    const result = await invModel.deleteInventory(inv_id);

    if (result && result.rowCount === 1) {
req.flash("success", "The vehicle was successfully deleted.")
return req.session.save(() => res.redirect("/inv"))
     
    }

    req.flash("error", "Delete failed. Please try again.");
    return res.redirect(`/inv/delete/${inv_id}`);
  } catch (err) {
    return next(err);
  }
};


// Build Edit Classification view
invCont.buildEditClassification = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id, 10)
    if (!Number.isInteger(classification_id)) {
      const err = new Error("Invalid classification id")
      err.status = 400
      return next(err)
    }

    const nav = await utilities.getNav()
    const classes = await invModel.getClassifications() 
    const row = classes.rows.find(r => r.classification_id === classification_id)

    if (!row) {
      req.flash("notice", "Classification not found.")
      return res.redirect("/inv/")
    }

    return res.render("inventory/edit-classification", {
      title: "Edit Classification",
      nav,
      errors: [],
      classification_id: row.classification_id,
      classification_name: row.classification_name,
    })
  } catch (e) {
    return next(e)
  }
}

// Process Update Classification

invCont.updateClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    let { classification_id, classification_name } = req.body

    classification_id = parseInt(classification_id, 10)
    classification_name = (classification_name || "").trim()

    const errors = []

    if (!Number.isInteger(classification_id)) errors.push({ msg: "Invalid classification id." })
    if (!classification_name) errors.push({ msg: "Please provide a classification name." })

    if (errors.length) {
      return res.status(400).render("inventory/edit-classification", {
        title: "Edit Classification",
        nav,
        errors,
        classification_id,
        classification_name
      })
    }

    const result = await invModel.updateClassification(classification_id, classification_name)

if (result && result.rowCount === 1) {
req.flash("success", `Classification updated to "${classification_name}".`)
return req.session.save(() => res.redirect("/inv"))

}

    return res.status(400).render("inventory/edit-classification", {
      title: "Edit Classification",
      nav,
      errors: [{ msg: "Update failed. Please try again." }],
      classification_id,
      classification_name,
    })
  } catch (e) {
    return next(e)
  }
}

// Build Delete Classification confirm view
invCont.buildDeleteClassification = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id, 10)
    if (!Number.isInteger(classification_id)) {
      const err = new Error("Invalid classification id")
      err.status = 400
      return next(err)
    }

    const nav = await utilities.getNav()
    const classes = await invModel.getClassifications()
    const row = classes.rows.find(r => r.classification_id === classification_id)

    if (!row) {
      req.flash("notice", "Classification not found.")
      return res.redirect("/inv/")
    }

    return res.render("inventory/delete-classification", {
      title: "Delete Classification",
      nav,
      errors: [],
      classification_id: row.classification_id,
      classification_name: row.classification_name,
    })
  } catch (e) {
    return next(e)
  }
}

// Process Delete Classification (block if vehicles exist)
invCont.deleteClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    let { classification_id } = req.body
    classification_id = parseInt(classification_id, 10)

    if (!Number.isInteger(classification_id)) {
      req.flash("notice", "Invalid classification id.")
      return res.redirect("/inv/")
    }

    const count = await invModel.countInventoryForClassification(classification_id)
    if (count > 0) {
      req.flash("notice", "Cannot delete: classification still has vehicles.")
      return res.status(400).render("inventory/delete-classification", {
        title: "Delete Classification",
        nav,
        errors: [{ msg: "Classification not empty. Remove or move vehicles first." }],
        classification_id,
        classification_name: "" 
      })
    }

    const result = await invModel.deleteClassification(classification_id)

if (result && result.rowCount === 1) {
req.flash("success", "Classification deleted.")
return req.session.save(() => res.redirect("/inv"))

}

    req.flash("notice", "Delete failed. Please try again.")
    return res.redirect("/inv/")
  } catch (e) {
    return next(e)
  }
}


module.exports = invCont