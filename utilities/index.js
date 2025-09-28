const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 * ************************ */
Util.getNav = async function () {
  const data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += `<li>
      <a href="/inv/type/${row.classification_id}"
         title="See our inventory of ${row.classification_name} vehicles">
        ${row.classification_name}
      </a>
    </li>`;
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data = []) {
  let grid = "";
  if (data.length > 0) {
    grid += '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += `
        <li>
          <a href="../../inv/detail/${vehicle.inv_id}"
             title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}"
                 alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
          </a>
          <div class="namePrice">
            <hr />
            <h2>
              <a href="../../inv/detail/${vehicle.inv_id}"
                 title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
          </div>
        </li>`;
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
  
};



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
 * Build the vehicle detail HTML (single item)
 * - Uses FULL image (inv_image)
 * - Formats price as USD and miles with commas
 * ************************************ */
Util.buildVehicleDetail = async function (vehicle) {
  if (!vehicle) {
    return '<p class="notice">Sorry, that vehicle could not be found.</p>';
  }

  const usd   = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                  .format(vehicle.inv_price);
  const miles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles);

  return `
    <article class="vehicle-detail">
      <figure class="vehicle-media">
        <img
          src="${vehicle.inv_image}"
          alt="Photo of ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}"
          loading="eager"
        />
        <figcaption>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</figcaption>
      </figure>

      <section class="vehicle-info" aria-label="Vehicle information">
        <h2 class="vehicle-title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p class="vehicle-price"><strong>${usd}</strong></p>

        <dl class="vehicle-specs">
          <div><dt>Make</dt><dd>${vehicle.inv_make}</dd></div>
          <div><dt>Model</dt><dd>${vehicle.inv_model}</dd></div>
          <div><dt>Year</dt><dd>${vehicle.inv_year}</dd></div>
          <div><dt>Mileage</dt><dd>${miles} miles</dd></div>
          <div><dt>Color</dt><dd>${vehicle.inv_color}</dd></div>
        </dl>

        <div class="vehicle-description">
          <h3>Description</h3>
          <p>${vehicle.inv_description}</p>
        </div>
      </section>
    </article>
  `;
};


module.exports = Util;


