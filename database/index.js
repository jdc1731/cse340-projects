// database/index.js
const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Hosted Postgres usually requires SSL. Disable only if you know you're local.
  ssl: process.env.PGSSL === "disable" ? false : { rejectUnauthorized: false },
  keepAlive: true,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// OPTIONAL: uncomment to log queries during dev
// const origQuery = pool.query.bind(pool)
// pool.query = async (...args) => {
//   const text = typeof args[0] === "string" ? args[0] : args[0]?.text
//   console.log("executed query", { text })
//   try { return await origQuery(...args) }
//   catch (err) { console.error("error in query", { text, err: err.message }); throw err }
// }

module.exports = pool
