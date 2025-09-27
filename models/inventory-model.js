const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
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
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get one vehicle by inv_id (single row or null)
 *  (Model = DB access function)
 * ************************** */
async function getVehicleById(inv_id) {
  const sql = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_price,
           inv_miles, inv_color, inv_description,
           inv_image, inv_thumbnail
    FROM public.inventory
    WHERE inv_id = $1
  `;
  const result = await pool.query(sql, [inv_id]); 
  return result.rows[0] || null;                
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById}