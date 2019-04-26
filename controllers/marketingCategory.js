const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');

const MarketingCategory = require('../models/marketingCategory');

exports.getAddMarketingCategory = (req, res, next) => {
  res.render('categories/edit-marketing-category', {
    pageTitle: 'Add Marketing Category',
    path: '/admin/add-marketing-category',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddMarketingCategory = (req, res, next) => {
  const code = req.body.code;
  const title = req.body.title;
  const description = req.body.description;
  const displayOrder = req.body.displayOrder;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('categories/edit-marketing-category', {
      pageTitle: 'Add Marketing Category',
      path: '/admin/add-marketing-category',
      editing: false,
      hasError: true,
      category: {
        code,
        title,
        description,
        displayOrder
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const marketingCategory = new MarketingCategory({
    code,
    title,
    description,
    displayOrder
  });
  marketingCategory
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Marketing Category');
      res.redirect('/admin/marketing-categories');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditMarketingCategory = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const categoryId = req.params.categoryId;
  MarketingCategory.findById(categoryId)
    .then(category => {
      if (!category) {
        return res.redirect('/');
      }
      res.render('categories/edit-marketing-category', {
        pageTitle: 'Edit Marketing Category',
        path: '/admin/edit-marketing-category',
        editing: editMode,
        category,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditMarketingCategory = (req, res, next) => {
  const categoryId = req.body.categoryId;
  const updatedCode = req.body.code;
  const updatedTitle = req.body.title;
  const updatedDesc = req.body.description;
  const updatedDisplayOrder = req.body.displayOrder;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('categories/edit-marketing-category', {
      pageTitle: 'Edit Marketing Category',
      path: '/admin/edit-marketing-category',
      editing: true,
      hasError: true,
      category: {
        code: updatedCode,
        title: updatedTitle,
        description: updatedDesc,
        displayOrder: updatedDisplayOrder,
        _id: categoryId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  MarketingCategory.findById(categoryId)
    .then(marketingCategory => {
        marketingCategory.code = updatedCode;
        marketingCategory.title = updatedTitle;
        marketingCategory.description = updatedDesc;
        marketingCategory.displayOrder = updatedDisplayOrder;
      return marketingCategory.save().then(result => {
        console.log('UPDATED MARKETING CATEGORY!');
        res.redirect('/admin/marketing-categories');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getMarketingCategories = (req, res, next) => {
    MarketingCategory.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(marketingCategories => {
      console.log(marketingCategories);
      res.render('categories/marketing-categories', {
        marketingCategories,
        pageTitle: 'Admin Marketing Categories',
        path: '/categories/marketing-categories'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteMarketingCategory = (req, res, next) => {
  const categoryId = req.params.categoryId;
  MarketingCategory.findById(categoryId)
    .then(marketingCategory => {
      if (!marketingCategory) {
        return next(new Error('Category not found.'));
      }
      return MarketingCategory.deleteOne({ _id: categoryId });
    })
    .then(() => {
      console.log('DESTROYED MARKETING CATEGORY');
      res.status(200).json({ message: 'Success!' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Deleting category failed.' });
    });
};