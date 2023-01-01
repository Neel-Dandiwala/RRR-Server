import express from 'express';
const { loginEntity, me, logoutEntity } = require('../controllers/LoginController')

const router = express.Router();

router.post('/login', loginEntity)
router.get('/me', me)
router.get('/logout', logoutEntity)

module.exports = router;