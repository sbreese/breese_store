const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const ordersController = require('../controllers/orders');

const router = express.Router();

// /admin/orders => GET
router.get('/orders', isAuth, ordersController.getAllOrders);

// /admin/orders/:userId => GET
router.get('/orders/:orderId', isAuth, ordersController.getOrder);

// /admin/orders/:orderId => PATCH
router.patch('/order/:orderId', isAuth, adminController.shippedOrder);

// /admin/orders/:orderId => DELETE
router.delete('/order/:orderId', isAuth, adminController.deleteOrder);


module.exports = router;
