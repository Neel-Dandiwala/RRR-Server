import express from 'express';
const { getCompanies, setCompany, updateCompany, deleteCompany} = require('../controllers/CompanyController')

const router = express.Router();

router.get('/companies', getCompanies)

router.post('/company/signup', setCompany)

router.put('/company/login', updateCompany)

router.delete('/company/login', deleteCompany)

module.exports = router;