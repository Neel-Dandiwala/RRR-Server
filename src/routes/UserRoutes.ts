import express from 'express';
const { getUsers, setUser, updateUser, deleteUser } = require('../controllers/UserController')

const router = express.Router();

router.get('/users', getUsers)

router.post('/user/signup', setUser)

router.put('/user/login', updateUser)

router.delete('/user/login', deleteUser)

module.exports = router;