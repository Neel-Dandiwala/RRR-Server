import express from 'express';
const { getAgents, setAgent, updateAgent, deleteAgent, validationAgent, getNearbyCompanies, getAgentBookings, agentRejectBooking, agentAcceptBooking, setAgentCompanyForm, wasteByBooking, getAgentCompanyBookings } = require('../controllers/AgentController')

const router = express.Router();

router.get('/agents', getAgents)

router.post('/agent/signup', setAgent)

router.post('/validation/agent', validationAgent);

router.post('/agent/booking/reject', agentRejectBooking);

router.post('/agent/booking/accept', agentAcceptBooking);

router.post('/agent/booking/waste', wasteByBooking);

router.get('/agent/nearbycompanies', getNearbyCompanies);

router.get('/agent/bookings', getAgentBookings)

router.get('/agent/company/bookings', getAgentCompanyBookings)

router.delete('/agent/login', deleteAgent)

router.post('/agent/companyForm', setAgentCompanyForm)


module.exports = router;