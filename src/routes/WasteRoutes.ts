import express from 'express';
const { wasteUser, wasteAgent, wasteCompany, wasteBlockchain, wasteComplete, getWasteQRDetails, getWasteFullDetails, wasteGenerateQR, getWasteQR, getWasteDetails, getWasteTimestamps } = require('../controllers/WasteController')
const { QRCodeGenerator } = require('../controllers/QRController')

const router = express.Router();

router.post('/waste/user', wasteUser);

router.post('/waste/agent', wasteAgent);

router.post('/waste/company', wasteCompany);

router.post('/waste', wasteBlockchain);

router.post('/waste/generateQR', QRCodeGenerator);

router.post('/waste/imageLink', getWasteQR);

router.get('/waste/:key', getWasteQRDetails);

router.post('/waste/details', getWasteDetails);

router.post('/waste/fulldetails', getWasteFullDetails);

router.post('/waste/timestamps', getWasteTimestamps);

router.post('/waste/complete', wasteComplete);

module.exports = router;
