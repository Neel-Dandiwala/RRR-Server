"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getCompanies, setCompany, updateCompany, deleteCompany, validationCompany } = require('../controllers/CompanyController');
const router = express_1.default.Router();
router.get('/companies', getCompanies);
router.post('/company/signup', setCompany);
router.post('/validation/company', validationCompany);
router.delete('/company/login', deleteCompany);
module.exports = router;
//# sourceMappingURL=CompanyRoutes.js.map