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
  const sql = `
    SELECT DISTINCT ON (i.inv_id)
      i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price,
      i.inv_miles, i.inv_color, i.inv_description,
      i.inv_image, i.inv_thumbnail,
      c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE i.classification_id = $1
    ORDER BY i.inv_id
  `;
  const { rows } = await pool.query(sql, [classification_id]);
  return rows;
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
  `;
  const result = await pool.query(sql, [inv_id]); 
  return result.rows[0] || null;                
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById}