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
  const title = req.body.title;
  const images = req.files;
  const price = req.body.price;
  const description = req.body.description;
  if (!images.length) {
    return res.status(422).render('categories/edit-category', {
      pageTitle: 'Add Category',
      path: '/admin/add-category',
      editing: false,
      hasError: true,
      category: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('categories/edit-category', {
      pageTitle: 'Add Category',
      path: '/categories/add-category',
      editing: false,
      hasError: true,
      category: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrls = [];
  for (i = 0; i < images.length; i++) {
    imageUrls.push(typeof images[i] === 'undefined' ? '' : images[i].path);
  }

  const category = new Category({
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    title: title,
    price: price,
    description: description,
    image1Url: imageUrls[0],
    image2Url: imageUrls[1],
    image3Url: imageUrls[2],
    image4Url: imageUrls[3],
    userId: req.user
  });
  category
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Category');
      res.redirect('/categories/categories');
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
  const prodId = req.params.categoryId;
  Category.findById(prodId)
    .then(category => {
      if (!category) {
        return res.redirect('/');
      }
      res.render('categories/edit-category', {
        pageTitle: 'Edit Category',
        path: '/categories/edit-category',
        editing: editMode,
        category: category,
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
  Category.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(categories => {
      console.log(categories);
      res.render('categories/categories', {
        prods: categories,
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