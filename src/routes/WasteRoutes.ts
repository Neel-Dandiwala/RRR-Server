import express from 'express';
const { wasteUser, wasteAgent, wasteCompany, wasteBlockchain, wasteComplete } = require('../controllers/WasteController')

const router = express.Router();

router.post('/waste/user', wasteUser);

router.post('/waste/agent', wasteAgent);

router.post('/waste/company', wasteCompany);

router.post('/waste', wasteBlockchain);

router.post('/waste/complete', wasteComplete);

module.exports = router;