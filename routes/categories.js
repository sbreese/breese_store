const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

/**
 * Complete CRUD for Categories
 */
// /admin/add-category => GET
router.get('/add-category', isAuth, adminController.getAddCategory);

// /admin/categories => GET
router.get('/categories', isAuth, adminController.getcategories);

// /admin/add-category => POST
router.post(
  '/add-category',
  [
    body('code')
      .isString()
      .isLength({ min: 2 })
      .trim(),
    body('title')
      .isString()
      .isLength({ min: 2 })
      .trim(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postAddCategory
);

router.get('/edit-category/:categoryId', isAuth, adminController.getEditCategory);

router.post(
  '/edit-category',
  [
    body('code')
      .isString()
      .isLength({ min: 2 })
      .trim(),
    body('title')
      .isString()
      .isLength({ min: 2 })
      .trim(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditcategory
);

router.delete('/category/:categoryId', isAuth, adminController.deleteCategory);

module.exports = router;
