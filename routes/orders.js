const express = require('express');

const isAuth = require('../middleware/is-auth');
const ordersController = require('../controllers/orders');

const router = express.Router();

// /admin/orders => GET
router.get('/orders', isAuth, ordersController.getAllOrders);

// /admin/orders/:userId => GET
router.get('/orders/:orderId', isAuth, ordersController.getOrder);

// /admin/orders/:orderId => PATCH
router.patch('/order/:orderId', isAuth, ordersController.shippedOrder);

// /admin/orders/:orderId => DELETE
router.delete('/order/:orderId', isAuth, ordersController.deleteOrder);


module.exports = router;
