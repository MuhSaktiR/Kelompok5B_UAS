const router = require('express').Router();
const homeController = require('../controllers/controller-home');

router.get('/', homeController.home);

module.exports = router;