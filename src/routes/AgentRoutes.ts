import express from 'express';
const { getAgents, setAgent, updateAgent, deleteAgent, validationAgent, getNearbyCompanies} = require('../controllers/AgentController')

const router = express.Router();

router.get('/agents', getAgents)

router.post('/agent/signup', setAgent)

router.post('/validation/agent', validationAgent);

router.get('/agent/nearbycompanies', getNearbyCompanies);

router.delete('/agent/login', deleteAgent)

module.exports = router;