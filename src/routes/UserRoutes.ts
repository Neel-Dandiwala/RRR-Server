import express from 'express';
const { getUsers, setUser, updateUser, deleteUser, validationUser, getNearbyAgents, getUserBalance, setUserAgentForm, getUserBookings, getUserBookings2, getAllTokens, getUserTokens } = require('../controllers/UserController')

const router = express.Router();

router.get('/users', getUsers)

router.get('/user/balance', getUserBalance)

router.get('/user/bookings', getUserBookings)

router.post('/validation/user', validationUser);

router.post('/user/signup', setUser)

router.post('/user/nearbyagents', getNearbyAgents)

router.post('/user/agentForm', setUserAgentForm)

router.post('/user/allTokens', getAllTokens)

router.post('/user/userTokens', getUserTokens)

// router.delete('/user/login', deleteUser)

module.exports = router;