"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getUsers, setUser, updateUser, deleteUser, validationUser, getNearbyAgents } = require('../controllers/UserController');
const router = express_1.default.Router();
router.get('/users', getUsers);
router.post('/validation/user', validationUser);
router.post('/user/signup', setUser);
router.post('/user/nearbyagents', getNearbyAgents);
module.exports = router;
//# sourceMappingURL=UserRoutes.js.map