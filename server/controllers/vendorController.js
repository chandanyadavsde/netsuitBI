const NsApi = require('../config/netsuit');

async function getAllVendors(req, res) {
    try {
        const response = await NsApi.request({
            path: 'record/v1/vendor',
            method: 'GET',
        });
        res.json(response.data); // Send the vendor data to the frontend
    } catch (err) {
        console.log("Error fetching vendor data:", err);
        res.status(500).json({ error: 'Failed to fetch vendor data' });
    }
}


async function getVendorById(req, res) {
    const vendorId = req.params.id; // Get vendor ID from URL parameter
    try {
        const response = await NsApi.request({
            path: `record/v1/vendor/${vendorId}`,
            method: 'GET',
        });
        res.json(response.data); // Send the single vendor data to the frontend
    } catch (err) {
        console.log(`Error fetching vendor with ID ${vendorId}:`, err);
        res.status(500).json({ error: `Failed to fetch vendor with ID ${vendorId}` });
    }
};



module.exports = { getAllVendors ,getVendorById};
