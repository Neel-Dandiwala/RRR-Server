import express from 'express';
const { loginEntity } = require('../controllers/LoginController')

const router = express.Router();

router.post('/login', loginEntity)

module.exports = router;