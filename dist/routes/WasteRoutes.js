"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { wasteUser, wasteAgent, wasteCompany, wasteBlockchain, wasteComplete, getWasteQRDetails, wasteGenerateQR, getWasteQR, getWasteDetails } = require('../controllers/WasteController');
const { QRCodeGenerator } = require('../controllers/QRController');
const router = express_1.default.Router();
router.post('/waste/user', wasteUser);
router.post('/waste/agent', wasteAgent);
router.post('/waste/company', wasteCompany);
router.post('/waste', wasteBlockchain);
router.post('/waste/generateQR', QRCodeGenerator);
router.post('/waste/imageLink', getWasteQR);
router.get('/waste/:key', getWasteQRDetails);
router.post('/waste/details', getWasteDetails);
router.post('/waste/complete', wasteComplete);
module.exports = router;
//# sourceMappingURL=WasteRoutes.js.map