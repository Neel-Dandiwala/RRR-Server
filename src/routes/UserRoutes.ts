import express from 'express';
const { getUsers, setUser, updateUser, deleteUser, validationUser, getNearbyAgents } = require('../controllers/UserController')

const router = express.Router();

router.get('/users', getUsers)

router.post('/validation/user', validationUser);

router.post('/user/signup', setUser)

router.post('/user/nearbyagents', getNearbyAgents)

// router.delete('/user/login', deleteUser)

module.exports = router;