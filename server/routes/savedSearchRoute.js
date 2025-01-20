const express = require('express');
const { fetchAndSaveSavedSearch4705 } = require('../controllers/savedSearchController4705');
const {fetchAndSaveSavedSearch4541} = require('../controllers/savedSearchController4541');

const router = express.Router();

router.get('/4705', fetchAndSaveSavedSearch4705);
router.get('/4541', fetchAndSaveSavedSearch4541);

module.exports = router;