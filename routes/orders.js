const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const ordersController = require('../controllers/orders');

const router = express.Router();

router.delete('/order/:orderId', isAuth, adminController.deleteOrder);
router.patch('/order/:orderId', isAuth, adminController.shippedOrder);
router.get('/orders', isAuth, ordersController.getAllOrders);

module.exports = router;
