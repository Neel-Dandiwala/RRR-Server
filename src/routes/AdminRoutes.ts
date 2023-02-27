import express from 'express';
const { getAdminQueries, loginAdmin, setQuery, replyQuery, getQuery, getAdminSession, logoutAdmin, getAdminTokens, deleteToken, setToken } = require('../controllers/AdminController')

const router = express.Router();

router.get('/admin/queries', getAdminQueries)

router.get('/admin/tokens', getAdminTokens)

router.post('/admin/tokens/delete', deleteToken)

router.post('/admin/login', loginAdmin)

router.post('/query', setQuery)

router.post('/admin/tokens/set', setToken)

router.post('/query/reply/:id', replyQuery)

router.get('/query/:id', getQuery)

router.get('/adminme', getAdminSession)

router.get('/admin/logout', logoutAdmin)

module.exports = router;