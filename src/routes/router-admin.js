const router = require('express').Router();
const adminController = require('../controllers/controller-admin');
const verifyUser = require('../configs/verify');

// Rute untuk halaman home admin
router.get('/homeadmin', verifyUser.isAdmin, adminController.getHomeAdmin);

module.exports = router;