const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.delete('/order/:orderId', isAuth, adminController.deleteOrder);

module.exports = router;
