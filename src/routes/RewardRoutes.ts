import express from 'express';
const { rewardTransferFrom, rewardMint, rewardBurn, getbs, getMarketplaceTokens, rewardMintToken, rewardBurnToken } = require('../controllers/RewardController')

const router = express.Router();

router.post('/reward/transferFrom', rewardTransferFrom);

router.post('/reward/mint', rewardMint);

router.post('/reward/burn', rewardBurn);

router.post('/reward/mintToken', rewardMintToken);

router.post('/reward/burnToken', rewardBurnToken);

router.get('/reward/all', getMarketplaceTokens);

router.get('/bs', getbs);

module.exports = router;
