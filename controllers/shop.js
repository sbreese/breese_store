const fs = require('fs');
const path = require('path');

const ejs = require('ejs');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const Product = require('../models/product');
const Order = require('../models/order');
const Category = require('../models/category');
const helper = require('./helper');

const ITEMS_PER_PAGE = 16;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

    // Begin process URL parameters:
    const param_1_key = req.params.param_1_key;
    let param_1_value = '';
    let filter, sort_by;
    if (req.params.param_1_value) {
      param_1_value = req.params.param_1_value.split('+').join(' ');
      if (param_1_key && param_1_key === 'search') {
          filter = { $text: { $search: param_1_value } };
      } else if (param_1_key === 'color') {
        filter = { "colors": { "$regex": param_1_value, "$options": "i" } };
      } else if (param_1_key === 'price' && param_1_value !== 'all') {
        const priceArray = param_1_value.replace(/\$/g, '').split('-');
        if (priceArray[1]) {
          filter = { "price": { "$gte": priceArray[0], "$lt": priceArray[1] } };
        } else {
          filter = { "price": { "$gte": priceArray[0] } };
        }
        param_1_value = param_1_value.replace('00 ','00+').replace('-',' - ');
      } else if (param_1_key === 'sort_by') {
  
        switch (param_1_value) {
          case 'Popularity':
            sort_by = { _id : -1 };
          break;
          case 'Average_rating':
            sort_by = { _id : 1 };
          break;
          case 'Newness':
            sort_by = { _id : -1 };
          break;
          case 'Price:_Low_to_High':
            sort_by = { price : 1 };
          break;
          case 'Price:_High_to_Low':
            sort_by = { price : -1 };
          break;
        } // END sort_by switch
        param_1_value = param_1_value.split('_').join(' ');
      } else if (param_1_key === 'tag') {
        filter = { "tags": param_1_value };
      } // END tag
    } // END param_1_value
    // End process URL parameters

  Category.find().then(categories => {
  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      helper.getShoppingCartData(req)
      .then(user_cart => {
        res.render('shop/product-list', {
          cart_items: user_cart.cart_items,
          cart_total: user_cart.cart_total,
          totalSum: helper.calcTotalPrice(user_cart.cart_items),
          wishlist: user_cart.wishlist,
          categories,
          categoryKey: param_1_key && param_1_key.toLowerCase(),
          resultInfo: helper.formatResultInfo(param_1_key, param_1_value, ITEMS_PER_PAGE, totalItems, page),
          sort_by: param_1_value,
          color: param_1_value,
              price_range: param_1_value,
              tag: param_1_value,
          products,
          pageTitle: 'Products',
          path: '/products',
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

const getSeasonYear = () => {

  let targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 20);
  const monthNumber = targetDate.getMonth();
  const year = targetDate.getFullYear();

  if (2 <= monthNumber <= 4) {
      return `Spring ${year}`;
  }

  if (5 <= monthNumber <= 7) {
      return `Summer ${year}`;
  }

  if (8 <= monthNumber <= 10) {
      return `Fall ${year}`;
  }

  // Months 11, 0, 1 (12, 01, 02)
  return `Winter ${year}`;
}

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  // Begin process URL parameters:
  const param_1_key = req.params.param_1_key;
  let param_1_value = '';
  let filter, sort_by;
  if (req.params.param_1_value) {
    param_1_value = req.params.param_1_value.split('+').join(' ');
    if (param_1_key && param_1_key === 'search') {
        filter = { $text: { $search: param_1_value } };
    } else if (param_1_key === 'color') {
      filter = { "colors": { "$regex": param_1_value, "$options": "i" } };
    } else if (param_1_key === 'price' && param_1_value !== 'all') {
      const priceArray = param_1_value.replace(/\$/g, '').split('-');
      if (priceArray[1]) {
        filter = { "price": { "$gte": priceArray[0], "$lt": priceArray[1] } };
      } else {
        filter = { "price": { "$gte": priceArray[0] } };
      }
      param_1_value = param_1_value.replace('00 ','00+').replace('-',' - ');
    } else if (param_1_key === 'sort_by') {

      switch (param_1_value) {
        case 'Popularity':
          sort_by = { _id : -1 };
        break;
        case 'Average_rating':
          sort_by = { _id : 1 };
        break;
        case 'Newness':
          sort_by = { _id : -1 };
        break;
        case 'Price:_Low_to_High':
          sort_by = { price : 1 };
        break;
        case 'Price:_High_to_Low':
          sort_by = { price : -1 };
        break;
      } // END sort_by switch
      param_1_value = param_1_value.split('_').join(' ');
    } else if (param_1_key === 'tag') {
      filter = { "tags": param_1_value };
    } // END tag
  } // END param_1_value
  // End process URL parameters

  Category.find().then(categories => {
  Product.find(filter)
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find(filter)
        .sort(sort_by)
        .populate('category')
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {

      param_1_value = param_1_value.replace('00 ','00+').replace('-',' - ');

      helper.getShoppingCartData(req)
      .then(user_cart => {
          res.render('newDesign/index', {
            products,
            cart_items: user_cart.cart_items,
            cart_total: user_cart.cart_total,
            totalSum: helper.calcTotalPrice(user_cart.cart_items),
            wishlist: user_cart.wishlist,
            categories,
            categoryKey: param_1_key && param_1_key.toLowerCase(),
            resultInfo: helper.formatResultInfo(param_1_key, param_1_value, ITEMS_PER_PAGE, totalItems, page),
            sort_by: param_1_value,
            color: param_1_value,
            price_range: param_1_value,
            tag: param_1_value,
            seasonYear: getSeasonYear(),
            pageTitle: 'Shop',
            path: '/',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProductPage = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  // Begin process URL parameters:
  const param_1_key = req.params.param_1_key;
  let param_1_value = '';
  let filter, sort_by;
  if (req.params.param_1_value) {
    param_1_value = req.params.param_1_value.split('+').join(' ');
    if (param_1_key && param_1_key === 'search') {
        filter = { $text: { $search: param_1_value } };
    } else if (param_1_key === 'color') {
      filter = { "colors": { "$regex": param_1_value, "$options": "i" } };
    } else if (param_1_key === 'price' && param_1_value !== 'all') {
      const priceArray = param_1_value.replace(/\$/g, '').split('-');
      if (priceArray[1]) {
        filter = { "price": { "$gte": priceArray[0], "$lt": priceArray[1] } };
      } else {
        filter = { "price": { "$gte": priceArray[0] } };
      }
      param_1_value = param_1_value.replace('00 ','00+').replace('-',' - ');
    } else if (param_1_key === 'sort_by') {

      switch (param_1_value) {
        case 'Popularity':
          sort_by = { _id : -1 };
        break;
        case 'Average_rating':
          sort_by = { _id : 1 };
        break;
        case 'Newness':
          sort_by = { _id : -1 };
        break;
        case 'Price:_Low_to_High':
          sort_by = { price : 1 };
        break;
        case 'Price:_High_to_Low':
          sort_by = { price : -1 };
        break;
      } // END sort_by switch
      param_1_value = param_1_value.split('_').join(' ');
    } else if (param_1_key === 'tag') {
      filter = { "tags": param_1_value };
    } // END tag
  } // END param_1_value
  // End process URL parameters

  Category.find().then(categories => {
  Product.find(filter)
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find(filter)
        .sort(sort_by)
        .populate('category')
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {

      helper.getShoppingCartData(req)
      .then(user_cart => {
        console.log("Did I make it this far user cart?");
        // console.log(products);
          res.render('newDesign/product', {
            products,
            cart_items: user_cart.cart_items,
            cart_total: user_cart.cart_total,
            totalSum: helper.calcTotalPrice(user_cart.cart_items),
            wishlist: user_cart.wishlist,
            categoryKey: param_1_key && param_1_key.toLowerCase(),
            categories,
            resultInfo: helper.formatResultInfo(param_1_key, param_1_value, ITEMS_PER_PAGE, totalItems, page),
            sort_by: param_1_value,
            color: param_1_value,
            price_range: param_1_value,
            tag: param_1_value,
            pageTitle: 'Product',
            path: '/product',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.patchFilterSearch = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  // Begin process URL parameters:
  const param_1_key = req.params.param_1_key;
  let param_1_value = '';
  let filter, sort_by;
  if (req.params.param_1_value) {
    param_1_value = req.params.param_1_value.split('+').join(' ');
    if (param_1_key && param_1_key === 'search') {
        filter = { $text: { $search: param_1_value } };
    } else if (param_1_key === 'color') {
      filter = { "colors": { "$regex": param_1_value, "$options": "i" } };
    } else if (param_1_key === 'price' && param_1_value !== 'all') {
      const priceArray = param_1_value.replace(/\$/g, '').split('-');
      if (priceArray[1]) {
        filter = { "price": { "$gte": priceArray[0], "$lt": priceArray[1] } };
      } else {
        filter = { "price": { "$gte": priceArray[0] } };
      }
      param_1_value = param_1_value.replace('00 ','00+').replace('-',' - ');
    } else if (param_1_key === 'sort_by') {

      switch (param_1_value) {
        case 'Popularity':
          sort_by = { _id : -1 };
        break;
        case 'Average_rating':
          sort_by = { _id : 1 };
        break;
        case 'Newness':
          sort_by = { _id : -1 };
        break;
        case 'Price:_Low_to_High':
          sort_by = { price : 1 };
        break;
        case 'Price:_High_to_Low':
          sort_by = { price : -1 };
        break;
      } // END sort_by switch
      param_1_value = param_1_value.split('_').join(' ');
    } else if (param_1_key === 'tag') {
      filter = { "tags": param_1_value };
    } // END tag
  } // END param_1_value
  // End process URL parameters

  Product.find(filter)
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find(filter)
        .sort(sort_by)
        .populate('category')
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
        
      helper.getShoppingCartData(req)
      .then(user_cart => {
        ejs.renderFile('/app/views/includes/product-list.ejs', {
          resultInfo: helper.formatResultInfo(param_1_key, param_1_value, ITEMS_PER_PAGE, totalItems, page),
          products, 
          wishlist: user_cart.wishlist,
          currentPage: page, 
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
          hasNextPage: ITEMS_PER_PAGE * page < totalItems, 
          hasPreviousPage: page > 1,
          csrfToken: req.csrfToken(),
          path: req.originalUrl
        }, {}, (err, productList) => {
            res.status(200).json({ message: 'Success!', productList });
        }); // closer ejs.renderFile
        
    }) // close user_cart
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  }) // close products
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}; // close handler

exports.getProductDetail = (req, res, next) => {
  const prodId = req.params.productId;

  Product.find()
  .limit(8)
  .then(products => {

    Product.findById(prodId)
    .then(product => {

      helper.getShoppingCartData(req)
      .then(user_cart => {
        res.render('newDesign/product-detail', {
          cart_items: user_cart.cart_items,
          cart_total: user_cart.cart_total,
          totalSum: helper.calcTotalPrice(user_cart.cart_items),
          wishlist: user_cart.wishlist,
          products: products,
          product: product,
          pageTitle: product.title,
          path: '/product-detail'
        }).catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });

    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getFeatured = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .populate('category')
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      console.log("OK, let's get shopping cart data!");

      helper.getShoppingCartData(req)
      .then(user_cart => {
        console.log("OK, let's render this!");
          res.render('newDesign/featured', {
            products,
            cart_items: user_cart.cart_items,
            cart_total: user_cart.cart_total,
            totalSum: helper.calcTotalPrice(user_cart.cart_items),
            wishlist: user_cart.wishlist,
            pageTitle: 'Featured',
            path: '/featured',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    });
};

exports.getNewArrivals = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

    // Begin process URL parameters:
    const param_1_key = req.params.param_1_key;
    let param_1_value = '';
    let filter, sort_by;
    if (req.params.param_1_value) {
      param_1_value = req.params.param_1_value.split('+').join(' ');
      if (param_1_key && param_1_key === 'search') {
          filter = { $text: { $search: param_1_value } };
      } else if (param_1_key === 'color') {
        filter = { "colors": { "$regex": param_1_value, "$options": "i" } };
      } else if (param_1_key === 'price' && param_1_value !== 'all') {
        const priceArray = param_1_value.replace(/\$/g, '').split('-');
        if (priceArray[1]) {
          filter = { "price": { "$gte": priceArray[0], "$lt": priceArray[1] } };
        } else {
          filter = { "price": { "$gte": priceArray[0] } };
        }
        param_1_value = param_1_value.replace('00 ','00+').replace('-',' - ');
      } else if (param_1_key === 'sort_by') {
  
        switch (param_1_value) {
          case 'Popularity':
            sort_by = { _id : -1 };
          break;
          case 'Average_rating':
            sort_by = { _id : 1 };
          break;
          case 'Newness':
            sort_by = { _id : -1 };
          break;
          case 'Price:_Low_to_High':
            sort_by = { price : 1 };
          break;
          case 'Price:_High_to_Low':
            sort_by = { price : -1 };
          break;
        } // END sort_by switch
        param_1_value = param_1_value.split('_').join(' ');
      } else if (param_1_key === 'tag') {
        filter = { "tags": param_1_value };
      } // END tag
    } // END param_1_value
    // End process URL parameters

 Category.find().then(categories => {
  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .populate('category')
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      console.log("OK, let's get shopping cart data!");

      helper.getShoppingCartData(req)
      .then(user_cart => {
        console.log("OK, let's render this!");
          res.render('newDesign/new-arrivals', {
            categories,
            products,
            cart_items: user_cart.cart_items,
            cart_total: user_cart.cart_total,
            totalSum: helper.calcTotalPrice(user_cart.cart_items),
            wishlist: user_cart.wishlist,
            sort_by: param_1_value,
            color: param_1_value,
            price_range: param_1_value,
            tag: param_1_value,
            categoryKey: param_1_key && param_1_key.toLowerCase(),
            resultInfo: helper.formatResultInfo(param_1_key, param_1_value, ITEMS_PER_PAGE, totalItems, page),
            seasonYear: getSeasonYear(),
            pageTitle: 'New Arrivals',
            path: '/new-arrivals',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCart = (req, res, next) => {
  if (req.user) {
    req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  } else {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: req.session.cart_items || []
    });
  }

};

exports.getShoppingCart = (req, res, next) => {

  helper.getShoppingCartData(req)
  .then(user_cart => {
    let total = 0;
    user_cart.cart_items.forEach(p => {
      total += p.quantity * p.product.price;
    });

    res.render('newDesign/shopping-cart', {
      cart_items: user_cart.cart_items,
      cart_total: user_cart.cart_total,
      totalSum: helper.calcTotalPrice(user_cart.cart_items),
      wishlist: user_cart.wishlist,
      totalSum: helper.formatter.format(total),
      pageTitle: 'Shopping Cart',
      path: '/shopping-cart'
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });

};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
  .then(product => {

  if (!req.user) {
    let cartProductIndex = -1;
    if (req.session.cart_items && req.session.cart_items.length > 0) {
      cartProductIndex = req.session.cart_items.findIndex(cp => {
        return cp.product._id === prodId;
      });
    } else {
      req.session.cart_items = [];
    } 
    let newQuantity = 1;
    
    const updatedCartItems = [...req.session.cart_items];
    if (cartProductIndex >= 0) {
      newQuantity = req.session.cart_items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        product,
        quantity: newQuantity
      });
    }
    return req.session.cart_items = updatedCartItems;
  } else {
    return req.user.addToCart(product);
  }

  })
  .then(result => {
    console.log(result);
    res.redirect('/cart');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.patchCartQtyChange = (req, res, next) => {
  const prodId = req.params.productId;
  const qtyChange = Number(req.params.qtyChange);

  Product.findById(prodId)
  .then(product => {

  if (!req.user) {
    
    let cartProductIndex = -1;
    if (req.session.cart_items && req.session.cart_items.length > 0) {
      cartProductIndex = req.session.cart_items.findIndex(cp => {
        return cp.product._id.toString() === prodId;
      });
    } else {
      req.session.cart_items = [];
    }
    let updatedCartItems = [...req.session.cart_items];
    if (cartProductIndex >= 0) {
      const newQuantity = req.session.cart_items[cartProductIndex].quantity + qtyChange;
      if (newQuantity > 0) {
        updatedCartItems[cartProductIndex].quantity = newQuantity;
      } else {
        // Change results in 0 or less products.  Remove from temp cart:
        updatedCartItems = req.session.cart_items.filter(item => {
          return item.product._id.toString() !== prodId;
        });
      }
    } else {
      updatedCartItems.push({
        product,
        quantity: qtyChange
      });
    }
    return req.session.cart_items = updatedCartItems;

  } else {
    req.user.addQtyToCart(product, qtyChange);
    return req.user.cart.items;
  }

  })
  .then(cart_items => {
    let total = 0;
    cart_items.forEach(p => {
      total += p.quantity * p.product.price;
    });
    const totalSum = helper.formatter.format(total);

    ejs.renderFile('/app/views/includes/cart.ejs', {
      cart_items, totalSum, csrfToken: req.csrfToken()
    }, {}, (err, cart) => {

      console.log("Here is standard right cart items an cart:");
      console.log(cart_items);

      ejs.renderFile('/app/views/includes/shopping-cart-full.ejs', {
        cart_items, totalSum, csrfToken: req.csrfToken()
      }, {}, (err, fullCart) => {

        const cart_total = helper.sumPropertyValue(cart_items, 'quantity');
        
        ejs.renderFile('/app/views/includes/show-cart.ejs', {
          cart_total
        }, {}, (err, showCart) => {

          ejs.renderFile('/app/views/includes/show-cart-mobile.ejs', {
            cart_total
          }, {}, (err, showCartMobile) => {

            res.status(200).json({ message: 'Success!', cart, fullCart, showCart, showCartMobile });
          })

        })

      })
      
    })
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.patchAddRemoveFromWishlist = (req, res, next) => {
  const prodId = req.params.productId;
  const add = Number(req.params.add);

  Product.findById(prodId)
  .then(product => {

    if (req.user) {

      if (add) {
        req.user.addProductToWishlist(prodId);
        return req.user.cart.wishlist;
      } else {
        req.user.removeProductFromWishlist(prodId);
        return req.user.cart.wishlist;
      }
    } else {
      // for guests, check if product already exists in wishlist
      let wishlistProductIndex = -1;
      if (req.session.wishlist && req.session.wishlist.length > 0) {
        
        wishlistProductIndex = req.session.wishlist.findIndex(wl => {
          return wl._id.toString() === prodId;
        });
      }
      if (wishlistProductIndex === -1 && add) {
        // add to session wishlist
        if (!req.session.wishlist) {
          req.session.wishlist = [];
        }
        req.session.wishlist.push({_id: prodId});
      } 
      if (!add) {
        // remove from session wishlist
        req.session.wishlist = req.session.wishlist.filter(item => {
          return item._id.toString() !== prodId;
        });
      }
      return req.session.wishlist;
    }

  })
  .then(wishlist => {

    ejs.renderFile('/app/views/includes/link-to-wishlist.ejs', {
      wishlist
    }, {}, (err, linkToWishlist) => {
      ejs.renderFile('/app/views/includes/link-to-wishlist-mobile.ejs', {
        wishlist
      }, {}, (err, linkToWishlistMobile) => {
        res.status(200).json({ message: 'Success!', linkToWishlist, linkToWishlistMobile });
      });
    });

  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  if (req.user) {
    req.user
      .removeFromCart(prodId)
      .then(result => {
        res.redirect('/cart');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  } else {

    const updatedCartItems = req.session.cart_items.filter(item => {
      return item.product._id !== prodId;
    });
    req.session.cart_items = updatedCartItems;
    res.redirect('/cart');
  }
};

exports.getCheckout = (req, res, next) => {
  
  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      const cart_items = user.cart.items;
      const wishlist = user.cart.wishlist;
      let total = 0;
      cart_items.forEach(p => {
        total += p.quantity * p.product.price;
      });
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout - Payment',
        cart_items,
        cart_total: helper.sumPropertyValue(cart_items, 'quantity'),
        wishlist,
        totalSum: helper.formatter.format(total)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express
  let totalSum = 0;

  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {  
      user.cart.items.forEach(p => {
        totalSum += p.quantity * p.product.price;
      });

      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.product._doc } };
      });
      const order = new Order({
        user: req.user,
        products: products,
        fulfillment_status: 0
      });
      return order.save();
    })    
    .then(order => {
      req.session.login_orders = [order];
      return req.user.addOrderToUser(order);
    })
    .then(result => {
      const charge = stripe.charges.create({
        amount: totalSum * 100,
        currency: 'usd',
        description: 'Demo Order',
        source: token,
        metadata: { order_id: result._id.toString() }
      });
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user': req.user._id })
    .then(orders => {

      helper.getShoppingCartData(req)
      .then(user_cart => {
        res.render('shop/orders', {
          path: '/orders',
          pageTitle: 'Your Orders',
          cart_items: user_cart.cart_items,
          cart_total: user_cart.cart_total,
          totalSum: helper.calcTotalPrice(user_cart.cart_items),
          wishlist: user_cart.wishlist,
          orders
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });

    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getMyOrders = (req, res, next) => {

  req.user
    .populate('cart.items.product')
    .populate('orders')
    .execPopulate()
    .then(user => {
console.log("Here is the orders:");
      console.log(user.orders);
      const cart_items = user.cart.items;
      let total = 0;
      cart_items.forEach(p => {
        total += p.quantity * p.product.price;
      });
      res.render('newDesign/my-orders', {
        path: '/my-orders',
        pageTitle: 'Your Orders',
        cart_items,
        cart_total: helper.sumPropertyValue(cart_items, 'quantity'),
        orders: user.orders,
        totalSum: helper.formatter.format(total)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

    /*
  Order.find({ 'user': req.user._id })
    .then(orders => {
      res.render('newDesign/my-orders', {
        path: '/my-orders',
        pageTitle: 'Your Orders',
        orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });*/
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              ' - ' +
              prod.quantity +
              ' x ' +
              helper.formatter.format(prod.product.price)
          );
      });
      pdfDoc.text('-----------------------');
      pdfDoc.fontSize(20).text('Total Price: ' + helper.formatter.format(totalPrice));

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch(err => next(err));
};
