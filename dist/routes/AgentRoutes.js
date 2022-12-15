"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getAgents, setAgent, updateAgent, deleteAgent } = require('../controllers/AgentController');
const router = express_1.default.Router();
router.get('/agents', getAgents);
router.post('/agent/signup', setAgent);
router.put('/agent/login', updateAgent);
router.delete('/agent/login', deleteAgent);
module.exports = router;
//# sourceMappingURL=AgentRoutes.js.map