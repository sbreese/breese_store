// const mongoose = require('mongoose');

const fileHelper = require('../util/file')

const {validationResult} = require('express-validator/check')

const Product = require('../models/product')
const Category = require('../models/category')

exports.getAddProduct = (req, res, next) => {
  Category.find().then(categories => {
    res.render('products/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      categories,
      product: null,
      hasError: false,
      errorMessage: null,
      validationErrors: []
    })
  })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title
  const images = req.files
  const price = req.body.price
  const category = req.body.category
  const description = req.body.description
  if (!images.length) {
    return res.status(422).render('products/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        category,
        price,
        description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    })
  }
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    console.log(errors.array())
    Category.find().then(categories => {
      return res.status(422).render('products/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: true,
        categories,
        product: {
          title,
          category,
          price,
          description
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array()
      })
    })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
  }

  const imageUrls = []
  for (i = 0; i < images.length; i++) {
    imageUrls.push(typeof images[i] === 'undefined' ? '' : images[i].path)
  }

  const product = new Product({
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    title,
    category,
    price,
    description,
    image1Url: imageUrls[0],
    image2Url: imageUrls[1],
    image3Url: imageUrls[2],
    image4Url: imageUrls[3],
    userId: req.user
  })
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product')
      res.redirect('/admin/products')
    })
    .catch(err => {
      // return res.status(500).render('products/edit-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/add-product',
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     image1Url: image1Url,
      //     price: price,
      //     description: description
      //   },
      //   errorMessage: 'Database operation failed, please try again.',
      //   validationErrors: []
      // });
      // res.redirect('/500');
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit
  if (!editMode) {
    return res.redirect('/')
  }
  const prodId = req.params.productId
  Category.find().then(categories => {
    Product.findById(prodId)
      .populate('category')
      .then(product => {
        if (!product) {
          return res.redirect('/')
        }
        res.render('products/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          editing: editMode,
          product,
          categories,
          hasError: false,
          errorMessage: null,
          validationErrors: []
        })
      })
  })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId
  const updatedTitle = req.body.title
  const updatedCategory = req.body.category
  const updatedPrice = req.body.price
  const image = req.file
  const updatedDesc = req.body.description

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).render('products/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        category: updatedCategory,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    })
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/')
      }
      console.log("Here is updated category:")
      console.log(updatedCategory)
      product.title = updatedTitle
      product.category = updatedCategory
      product.price = updatedPrice
      product.description = updatedDesc
      if (image) {
        fileHelper.deleteFile(product.image1Url)
        product.image1Url = image.path
      }
      return product.save().then(result => {
        console.log('UPDATED PRODUCT!')
        res.redirect('/admin/products')
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      res.render('products/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found.'))
      }
      fileHelper.deleteFile(product.image1Url)
      return Product.deleteOne({_id: prodId, userId: req.user._id})
    })
    .then(() => {
      console.log('DESTROYED PRODUCT')
      res.status(200).json({message: 'Success!'})
    })
    .catch(err => {
      res.status(500).json({message: 'Deleting product failed.'})
    })
}