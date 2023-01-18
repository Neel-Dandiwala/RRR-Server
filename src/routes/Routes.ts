import express from 'express';
const router = express.Router();

router.get('/', (_, res) => {
    res.status(200).json({message: 'Not Valid Entry Point'});
})

module.exports = router;