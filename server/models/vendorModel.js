// const pool = require('../config/db');

// // Fetch all vendors from the database
// async function getAllVendors() {
//     try {
//         const response = await NsApi.request({
//             path: 'record/v1/vendor',
//             method: 'GET',
//         });
//         res.json(response.data); // Send the vendor data to the frontend
//     } catch (err) {
//         console.log("Error fetching vendor data:", err);
//         res.status(500).json({ error: 'Failed to fetch vendor data' });
//     }
// }

// // Fetch a single vendor by ID
// async function fetchVendorById(id) {
//     const result = await pool.query('SELECT * FROM vendors WHERE id = $1', [id]);
//     return result.rows[0];
// }

// module.exports = { getAllVendors, fetchVendorById };
