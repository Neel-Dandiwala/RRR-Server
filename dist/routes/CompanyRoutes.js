"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getCompanies, setCompany, updateCompany, deleteCompany, validationCompany, getCompanyAgentBookings, companyRejectBooking, companyAcceptBooking } = require('../controllers/CompanyController');
const router = express_1.default.Router();
router.get('/companies', getCompanies);
router.get('/company/agent/bookings', getCompanyAgentBookings);
router.post('/company/signup', setCompany);
router.post('/validation/company', validationCompany);
router.delete('/company/login', deleteCompany);
router.post('/company/booking/reject', companyRejectBooking);
router.post('/company/booking/accept', companyAcceptBooking);
module.exports = router;
//# sourceMappingURL=CompanyRoutes.js.map