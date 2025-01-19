const express = require('express');
const router = express.Router();
const userController = require('../controllers/controller-user');
const verifyUser = require('../configs/verify');

// Rute untuk halaman home user
router.get('/home', verifyUser.isUser, userController.getHomeUser);

module.exports = router;