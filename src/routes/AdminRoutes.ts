import express from 'express';
const { getAdminQueries, loginAdmin, setQuery, replyQuery, getQuery, getAdminSession, logoutAdmin } = require('../controllers/AdminController')

const router = express.Router();

router.get('/admin', getAdminQueries)

router.post('/admin/login', loginAdmin)

router.post('/query', setQuery)

router.post('/query/reply/:id', replyQuery)

router.get('/query/:id', getQuery)

router.get('/adminme', getAdminSession)

router.get('/admin/logout', logoutAdmin)

module.exports = router;