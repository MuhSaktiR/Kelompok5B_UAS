const router = require('express').Router();
const adminPesananController = require('../controllers/controller-admin');
const verifyUser = require('../configs/verify');

// Rute untuk halaman manage pesanan
router.get('/', verifyUser.isAdmin, adminPesananController.getManagePesanan);
router.delete('/delete/:id', verifyUser.isAdmin, adminPesananController.deletePesanan); // Rute untuk menghapus pesanan
router.get('/detail/:id', verifyUser.isAdmin, adminPesananController.getDetailPesanan); // Rute untuk detail pesanan
router.put('/edit/:id', verifyUser.isAdmin, adminPesananController.editPesanan); // Rute untuk mengedit pesanan

module.exports = router;