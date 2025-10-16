// models/inventory-model.js
const pool = require("../database/")

/* =========================
 * Classifications 
 * ========================= */
async function getClassifications() {
  return pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  )
}

async function countInventoryForClassification(classification_id) {
  const sql = `
    SELECT COUNT(*)::int AS count
    FROM public.inventory
    WHERE classification_id = $1
  `
  const result = await pool.query(sql, [Number(classification_id)])
  return result.rows[0]?.count ?? 0
}

async function updateClassification(classification_id, classification_name) {
  const sql = `
    UPDATE public.classification
       SET classification_name = $2
     WHERE classification_id   = $1
     RETURNING classification_id, classification_name
  `
  return pool.query(sql, [Number(classification_id), classification_name.trim()])
}

async function deleteClassification(classification_id) {
  const sql = `
    DELETE FROM public.classification
     WHERE classification_id = $1
     RETURNING classification_id
  `
  return pool.query(sql, [Number(classification_id)])
}

/* =========================
 * Inventory 
 * ========================= */
async function getInventoryByClassificationId(classification_id) {
  const data = await pool.query(
    `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
         ON i.classification_id = c.classification_id 
     WHERE i.classification_id = $1`,
    [classification_id]
  )
  return data.rows
}

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

async function addClassification(classification_name) {
  const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1)
    RETURNING classification_id
  `
  return pool.query(sql, [classification_name])
}

async function addInventory({
  inv_make, inv_model, inv_year, inv_description,
  inv_image, inv_thumbnail, inv_price, inv_miles,
  inv_color, classification_id,
}) {
  const sql = `
    INSERT INTO public.inventory
      (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
       inv_price, inv_miles, inv_color, classification_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING inv_id
  `
  return pool.query(sql, [
    inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
    inv_price, inv_miles, inv_color, classification_id,
  ])
}

async function updateInventory({
  inv_id, inv_make, inv_model, inv_year, inv_description,
  inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,
}) {
  const sql = `
    UPDATE public.inventory
       SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4,
           inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8,
           inv_color = $9, classification_id = $10
     WHERE inv_id = $11
     RETURNING *
  `
  const data = await pool.query(sql, [
    inv_make, inv_model, inv_description, inv_image, inv_thumbnail,
    inv_price, inv_year, inv_miles, inv_color, classification_id, inv_id
  ])
  return data.rows[0]
}

async function deleteInventory(inv_id) {
  const sql = "DELETE FROM public.inventory WHERE inv_id = $1 RETURNING inv_id"
  return pool.query(sql, [inv_id])
}

module.exports = {
  getClassifications,
  countInventoryForClassification,
  updateClassification,
  deleteClassification,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
  updateInventory,
  deleteInventory,
}
