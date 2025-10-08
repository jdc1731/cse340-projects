const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  // returns the full result; callers can use .rows
  return pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  )
}

/* ***************************
 *  Get all inventory items (with classification) by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
         ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    throw error
  }
}

/* ***************************
 *  Get one vehicle by inv_id
 * ************************** */
async function getVehicleById(inv_id) {
  const sql = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_price,
           inv_miles, inv_color, inv_description,
           inv_image, inv_thumbnail
    FROM public.inventory
    WHERE inv_id = $1
  `
  const result = await pool.query(sql, [inv_id])
  return result.rows[0] || null
}

/* ***************************
 *  Insert a new classification
 * ************************** */
async function addClassification(classification_name) {
  const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1)
    RETURNING classification_id
  `
  return pool.query(sql, [classification_name])
}

/* ***************************
 *  Insert a new inventory item
 * ************************** */
async function addInventory({
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
}) {
  const sql = `
    INSERT INTO public.inventory
      (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
       inv_price, inv_miles, inv_color, classification_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING inv_id
  `
  const params = [
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
  ]
  return pool.query(sql, params)
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
}
