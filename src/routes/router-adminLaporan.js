// Ini adalah router untuk halaman manage laporan
const router = require('express').Router();
const adminLaporanController = require('../controllers/controller-admin');
const verifyUser = require('../configs/verify');

// Rute untuk halaman manage laporan
router.get('/', verifyUser.isAdmin, adminLaporanController.getManageLaporan);

module.exports = router;