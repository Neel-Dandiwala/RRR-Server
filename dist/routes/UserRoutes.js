"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getUsers, setUser, updateUser, deleteUser, validationUser, getNearbyAgents, getUserBalance, setUserAgentForm, getUserBookings, getUserBookings2, getAllTokens, getUserTokens } = require('../controllers/UserController');
const router = express_1.default.Router();
router.get('/users', getUsers);
router.get('/user/balance', getUserBalance);
router.get('/user/bookings', getUserBookings);
router.post('/validation/user', validationUser);
router.post('/user/signup', setUser);
router.post('/user/nearbyagents', getNearbyAgents);
router.post('/user/agentForm', setUserAgentForm);
router.post('/user/allTokens', getAllTokens);
router.post('/user/userTokens', getUserTokens);
module.exports = router;
//# sourceMappingURL=UserRoutes.js.map