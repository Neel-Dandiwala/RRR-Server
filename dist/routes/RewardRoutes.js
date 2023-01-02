"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { rewardTransferFrom, rewardMint, rewardBurn, rewardMintToken, rewardBurnToken } = require('../controllers/RewardController');
const router = express_1.default.Router();
router.post('/reward/transferFrom', rewardTransferFrom);
router.post('/reward/mint', rewardMint);
router.post('/reward/burn', rewardBurn);
router.post('/reward/mintToken', rewardMintToken);
router.post('/reward/burnToken', rewardBurnToken);
module.exports = router;
//# sourceMappingURL=RewardRoutes.js.map