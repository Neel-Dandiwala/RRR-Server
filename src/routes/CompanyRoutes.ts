import express from 'express';
const { getCompanies, setCompany, updateCompany, deleteCompany, validationCompany, getCompanyAgentBookings, companyRejectBooking, companyAcceptBooking } = require('../controllers/CompanyController')

const router = express.Router();

router.get('/companies', getCompanies)

router.get('/company/agent/bookings', getCompanyAgentBookings)

router.post('/company/signup', setCompany)

router.post('/validation/company', validationCompany);

router.delete('/company/login', deleteCompany)

router.post('/company/booking/reject', companyRejectBooking);

router.post('/company/booking/accept', companyAcceptBooking);

module.exports = router;