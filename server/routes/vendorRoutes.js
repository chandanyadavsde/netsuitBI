const express = require('express');
const { getAllVendors,getVendorById} = require('../controllers/vendorController');

const router = express.Router();

router.get('/', getAllVendors);
router.get('/:id', getVendorById);


module.exports = router;
