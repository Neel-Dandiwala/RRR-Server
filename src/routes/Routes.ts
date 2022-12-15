import express from 'express';
const router = express.Router();

router.get('/agent/login', (_, res) => {
    res.status(200).json({message: 'Agent'});
})

router.get('/factory/login', (_, res) => {
    res.status(200).json({message: 'Factory'});
})

router.get('/', (_, res) => {
    res.status(200).json({message: '1'});
})

module.exports = router;