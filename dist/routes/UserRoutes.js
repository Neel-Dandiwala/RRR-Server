"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getUsers, setUser, updateUser, deleteUser } = require('../controllers/UserController');
const router = express_1.default.Router();
router.get('/users', getUsers);
router.post('/user/signup', setUser);
router.put('/user/login', updateUser);
router.delete('/user/login', deleteUser);
module.exports = router;
//# sourceMappingURL=UserRoutes.js.map