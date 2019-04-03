const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/about', shopController.getAbout);

router.get('/contact', shopController.getContact);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

// router.get('/cart', isAuth, shopController.getCart);
router.get('/cart', shopController.getCart); // OLD
router.get('/shopping-cart', shopController.getShoppingCart); // NEW

// router.post('/cart', isAuth, shopController.postCart);
router.post('/cart', shopController.postCart);

// router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
