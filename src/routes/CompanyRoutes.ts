import express from 'express';
const { getCompanies, setCompany, updateCompany, deleteCompany, validationCompany, getCompanyAgentBookings } = require('../controllers/CompanyController')

const router = express.Router();

router.get('/companies', getCompanies)

router.get('/company/agent/bookings', getCompanyAgentBookings)

router.post('/company/signup', setCompany)

router.post('/validation/company', validationCompany);

router.delete('/company/login', deleteCompany)

module.exports = router;