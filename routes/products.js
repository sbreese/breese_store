const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const productController = require('../controllers/product');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, productController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, productController.getProducts);

// /admin/add-product => POST
router.post(
  '/add-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  productController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, productController.getEditProduct);

router.post(
  '/edit-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  productController.postEditProduct
);

router.delete('/product/:productId', isAuth, productController.deleteProduct);

module.exports = router;
