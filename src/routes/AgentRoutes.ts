import express from 'express';
const { getAgents, setAgent, updateAgent, deleteAgent} = require('../controllers/AgentController')

const router = express.Router();

router.get('/agents', getAgents)

router.post('/agent/signup', setAgent)

router.put('/agent/login', updateAgent)

router.delete('/agent/login', deleteAgent)

module.exports = router;