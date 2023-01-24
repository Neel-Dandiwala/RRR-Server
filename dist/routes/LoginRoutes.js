"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { loginEntity, me, logoutEntity } = require('../controllers/LoginController');
const router = express_1.default.Router();
router.post('/login', loginEntity);
router.get('/me', me);
router.get('/logout', logoutEntity);
module.exports = router;
//# sourceMappingURL=LoginRoutes.js.map