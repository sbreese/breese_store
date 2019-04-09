const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);
router.get('/product', shopController.getProductPage);
router.get('/product-detail/:productId', shopController.getProductDetail);

router.get('/about', shopController.getAbout);

router.get('/blog', shopController.getBlog);
router.get('/blog-detail', shopController.getBlogDetail);

router.get('/contact', shopController.getContact);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

// /change-cart/:productId/:qtyChange => PATCH
router.patch('/change-cart/:productId/:qtyChange', shopController.patchCartQtyChange);

// /wishlist/:productId/:add => PATCH
router.patch('/wishlist/:productId/:add', shopController.patchAddRemoveFromWishlist);

// router.get('/cart', isAuth, shopController.getCart);
router.get('/cart', shopController.getCart); // OLD
router.get('/shopping-cart', shopController.getShoppingCart); // NEW

// router.post('/cart', isAuth, shopController.postCart);
router.post('/cart', shopController.postCart);

// router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);
router.get('/my-orders', isAuth, shopController.getMyOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
