"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { getAdminQueries, loginAdmin, setQuery, replyQuery, getQuery, getAdminSession, logoutAdmin } = require('../controllers/AdminController');
const router = express_1.default.Router();
router.get('/admin', getAdminQueries);
router.post('/admin/login', loginAdmin);
router.post('/query', setQuery);
router.post('/query/reply/:id', replyQuery);
router.get('/query/:id', getQuery);
router.get('/adminme', getAdminSession);
router.get('/admin/logout', logoutAdmin);
module.exports = router;
//# sourceMappingURL=AdminRoutes.js.map