const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const categoryController = require('../controllers/category');
const marketingCategoryController = require('../controllers/marketingCategory');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

/**
 * Complete CRUD for Categories
 */
// /admin/add-category => GET

router.get('/add-category', isAuth, categoryController.getAddCategory);
router.get('/add-marketing-category', isAuth, marketingCategoryController.getAddMarketingCategory);

// /admin/categories => GET
router.get('/categories', isAuth, categoryController.getCategories);
router.get('/marketing-categories', isAuth, marketingCategoryController.getMarketingCategories);

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
      .trim(),
    body('displayOrder')
      .isNumeric()
  ],
  isAuth,
  categoryController.postAddCategory
);

router.post(
  '/add-marketing-category',
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
      .trim(),
    body('displayOrder')
      .isNumeric()
  ],
  isAuth,
  marketingCategoryController.postAddMarketingCategory
);

// /admin/edit-category => GET
router.get('/edit-category/:categoryId', isAuth, categoryController.getEditCategory);
router.get('/edit-marketing-category/:categoryId', isAuth, marketingCategoryController.getEditMarketingCategory);

// /admin/edit-category => POST
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
  categoryController.postEditCategory
);
router.post(
  '/edit-marketing-category',
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
  marketingCategoryController.postEditMarketingCategory
);

// /admin/category:categoryId => DELETE
router.delete('/category/:categoryId', isAuth, categoryController.deleteCategory);
router.delete('/marketing-category/:categoryId', isAuth, marketingCategoryController.deleteMarketingCategory);

module.exports = router;
