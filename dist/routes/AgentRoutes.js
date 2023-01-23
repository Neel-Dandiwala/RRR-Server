"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getAgents, setAgent, updateAgent, deleteAgent, validationAgent, getNearbyCompanies, getAgentBookings, agentRejectBooking, agentAcceptBooking, setAgentCompanyForm, wasteByBooking } = require('../controllers/AgentController');
const router = express_1.default.Router();
router.get('/agents', getAgents);
router.post('/agent/signup', setAgent);
router.post('/validation/agent', validationAgent);
router.post('/agent/booking/reject', agentRejectBooking);
router.post('/agent/booking/accept', agentAcceptBooking);
router.post('/agent/booking/waste', wasteByBooking);
router.get('/agent/nearbycompanies', getNearbyCompanies);
router.get('/agent/bookings', getAgentBookings);
router.delete('/agent/login', deleteAgent);
router.post('/agent/companyForm', setAgentCompanyForm);
module.exports = router;
//# sourceMappingURL=AgentRoutes.js.map