const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');

const Category = require('../models/category');

exports.getAddCategory = (req, res, next) => {
  res.render('categories/edit-category', {
    pageTitle: 'Add Category',
    path: '/admin/add-category',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddCategory = (req, res, next) => {
  const code = req.body.code;
  const title = req.body.title;
  const description = req.body.description;
  const displayOrder = req.body.displayOrder;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-category', {
      pageTitle: 'Add Category',
      path: '/admin/add-category',
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

  const category = new Category({
    code,
    title,
    description,
    displayOrder
  });
  category
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Category');
      res.redirect('/admin/categories');
    })
    .catch(err => {
      // return res.status(500).render('admin/edit-category', {
      //   pageTitle: 'Add Category',
      //   path: '/admin/add-category',
      //   editing: false,
      //   hasError: true,
      //   category: {
      //     title: title,
      //     image1Url: image1Url,
      //     price: price,
      //     description: description
      //   },
      //   errorMessage: 'Database operation failed, please try again.',
      //   validationErrors: []
      // });
      // res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditCategory = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const categoryId = req.params.categoryId;
  Category.findById(categoryId)
    .then(category => {
      if (!category) {
        return res.redirect('/');
      }
      console.log("Hi Steve, here is what I'll get for you.");
      console.log(category);
      res.render('category/edit-category', {
        pageTitle: 'Edit Category',
        path: '/admin/edit-category',
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

exports.postEditCategory = (req, res, next) => {
  const prodId = req.body.categoryId;
  const updatedTitle = req.body.title;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('categories/edit-category', {
      pageTitle: 'Edit Category',
      path: '/categories/edit-category',
      editing: true,
      hasError: true,
      category: {
        title: updatedTitle,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Category.findById(prodId)
    .then(category => {
      if (category.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      category.title = updatedTitle;
      category.price = updatedPrice;
      category.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(category.image1Url);
        category.image1Url = image.path;
      }
      return category.save().then(result => {
        console.log('UPDATED CATEGORY!');
        res.redirect('/categories/categories');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCategories = (req, res, next) => {
  Category.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(categories => {
      console.log(categories);
      res.render('categories/categories', {
        categories,
        pageTitle: 'Admin Categories',
        path: '/categories/categories'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteCategory = (req, res, next) => {
  const prodId = req.params.categoryId;
  Category.findById(prodId)
    .then(category => {
      if (!category) {
        return next(new Error('Category not found.'));
      }
      fileHelper.deleteFile(category.image1Url);
      return Category.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED CATEGORY');
      res.status(200).json({ message: 'Success!' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Deleting category failed.' });
    });
};