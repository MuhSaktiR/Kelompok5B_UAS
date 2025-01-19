const express = require('express');
const router = express.Router();
const pesananController = require('../controllers/controller-pesanan');
const verifyUser = require('../configs/verify');

// Rute untuk halaman pemesanan
router.get('/', verifyUser.isLogin, pesananController.getPesanan);
router.get('/:id', verifyUser.isLogin, pesananController.getDetailPesanan); // Rute untuk detail pesanan
router.post('/', verifyUser.isLogin, pesananController.konfirmasiPesanan);
router.post('/cancel/:id', verifyUser.isLogin, pesananController.cancelPesanan); // Rute untuk pembatalan pesanan

module.exports = router;