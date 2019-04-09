const fs = require('fs');
const path = require('path');

const ejs = require('ejs');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const Product = require('../models/product');
const Order = require('../models/order');
const Category = require('../models/category');

// usage: sumPropertyValue(items, 'quantity')
const sumPropertyValue = (items, prop) => items.reduce((a, b) => a + b[prop], 0);
// usage: formatter.format(total)
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

const ITEMS_PER_PAGE = 20;

exports.getShoppingCartData = req => {

  return new Promise((resolve, reject) => {
    if (req.user) {
      req.user
      .populate('cart.items.product')
      .execPopulate()
      .then(user => {
        const cart_items = user.cart.items;
        resolve({
          cart_items,
          cart_total: sumPropertyValue(cart_items, 'quantity')
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        reject(error);
      });
    } else {
      const cart_items = req.session.cart_items || [];
      resolve({
        cart_items,
        cart_total: cart_items.length ? sumPropertyValue(cart_items, 'quantity') : 0
      });
    }
  });

}

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
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

      if (req.user) {
        req.user
        .populate('cart.items.product')
        .execPopulate()
        .then(user => {
          res.render('newDesign/index', {
            products,
            cart_items: user.cart.items,
            cart_total: sumPropertyValue(user.cart.items, 'quantity'),
            categories,
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
      } else {
        const cart_items = req.session.cart_items || [];
        res.render('newDesign/index', {
          products,
          cart_items,
          cart_total: cart_items.length ? sumPropertyValue(cart_items, 'quantity') : 0,
          wishlist_total: req.session.wishlist && req.session.wishlist.length || 0,
          categories,
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
      }
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

      if (req.user) {
        req.user
        .populate('cart.items.product')
        .execPopulate()
        .then(user => {
          res.render('newDesign/product', {
            products,
            cart_items: user.cart.items,
            cart_total: sumPropertyValue(user.cart.items, 'quantity'),
            wishlist_total: user.cart.wishlist.length,
            categories,
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
      } else {
        const cart_items = req.session.cart_items || [];
        res.render('newDesign/product', {
          products,
          cart_items,
          cart_total: cart_items.length ? sumPropertyValue(cart_items, 'quantity') : 0,
          categories,
          pageTitle: 'Product',
          path: '/product',
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
      }
    })
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProductDetail = (req, res, next) => {
  const prodId = req.params.productId;

  Product.find()
  .limit(8)
  .then(products => {

    Product.findById(prodId)
    .then(product => {

      this.getShoppingCartData(req)
      .then(user_cart => {
        res.render('newDesign/product-detail', {
          cart_items: user_cart.cart_items,
          cart_total: user_cart.cart_total,
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

exports.getBlog = (req, res, next) => {

  this.getShoppingCartData(req)
    .then(user_cart => {
    res.render('newDesign/blog', {
      cart_items: user_cart.cart_items,
      cart_total: user_cart.cart_total,
      pageTitle: 'Blog',
      path: '/blog'
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

exports.getBlogDetail = (req, res, next) => {

  this.getShoppingCartData(req)
    .then(user_cart => {
      res.render('newDesign/blog-detail', {
        cart_items: user_cart.cart_items,
        cart_total: user_cart.cart_total,
        pageTitle: 'Blog Detail',
        path: '/blog-detail'
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

exports.getAbout = (req, res, next) => {

  this.getShoppingCartData(req)
    .then(user_cart => {
    res.render('newDesign/about', {
      cart_items: user_cart.cart_items,
      cart_total: user_cart.cart_total,
      pageTitle: 'Shop',
      path: '/about'
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

exports.getContact = (req, res, next) => {

  this.getShoppingCartData(req)
    .then(user_cart => {
    res.render('newDesign/contact', {
      cart_items: user_cart.cart_items,
      cart_total: user_cart.cart_total,
      pageTitle: 'Contact',
      path: '/contact'
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

  this.getShoppingCartData(req)
  .then(user_cart => {
    let total = 0;
    user_cart.cart_items.forEach(p => {
      total += p.quantity * p.product.price;
    });

    res.render('newDesign/shopping-cart', {
      cart_items: user_cart.cart_items,
      cart_total: user_cart.cart_total,
      totalSum: formatter.format(total),
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

    // const productTitle = req.body.productTitle;
    
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
          console.log("Lets check if this is existing (equals above):");
          console.log(`${item.product._id.toString()} == ${prodId}`);
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
    ejs.renderFile('/app/views/includes/cart.ejs', {
      cart_items, csrfToken: req.csrfToken()
    }, {}, (err, cart) => {

      let total = 0;
      cart_items.forEach(p => {
        total += p.quantity * p.product.price;
      });

      ejs.renderFile('/app/views/includes/shopping-cart-full.ejs', {
        cart_items, totalSum: formatter.format(total), csrfToken: req.csrfToken()
      }, {}, (err, fullCart) => {

        const cart_total = sumPropertyValue(cart_items, 'quantity');
        
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

  
  console.log("|"+add+"|");
  Product.findById(prodId)
  .then(product => {

  if (req.user) {

    if (add) {
      req.user.addProductToWishlist(prodId);
      console.log("What did I get back?", req.user.cart.wishlist);
      return req.user.cart.wishlist;

      console.log("Should not get here 1");
    } else {
      req.user
      .removeProductFromWishlist(prodId)
      .then(result => {
        console.log("Should not get here 2");
        return result.cart.wishlist;
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
      console.log("Should not get here 3");
    }
    console.log("Should not get here 4");

  } else {
    // for guests, check if product already exists in wishlist
    let wishlistProductIndex = -1;
    if (req.session.wishlist && req.session.wishlist.length > 0) {
      
      wishlistProductIndex = req.session.wishlist.findIndex(wl => {
        return wl._id.toString() === prodId;
      });
    } else {
      req.session.wishlist = [];
    }
    if (wishlistProductIndex === -1 && add) {
      // add to session wishlist
      return req.session.wishlist.push(prodId);
    } else {
      // remove from session wishlist
      return req.session.wishlist.filter(item => {
        console.log("Lets check if this is existing (equals above):");
        console.log(`${item.product._id.toString()} == ${prodId}`);
        return item._id.toString() !== prodId;
      });
    }
  }

  })
  .then(wishlist => {
    console.log("OK, lets see what we got in 2nd phase?");
    console.log(wishlist);

    ejs.renderFile('/app/views/includes/link-to-wishlist.ejs', {
      wishlist_total: wishlist.length
    }, {}, (err, linkToWishlist) => {
        res.status(200).json({ message: 'Success!', linkToWishlist });
    })
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
      let total = 0;
      cart_items.forEach(p => {
        total += p.quantity * p.product.price;
      });
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout - Payment',
        cart_items,
        cart_total: cart_items.length ? sumPropertyValue(cart_items, 'quantity') : 0,
        totalSum: formatter.format(total)
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
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders
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
        cart_total: cart_items.length ? sumPropertyValue(cart_items, 'quantity') : 0,
        orders: user.orders,
        totalSum: formatter.format(total)
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
              formatter.format(prod.product.price)
          );
      });
      pdfDoc.text('-----------------------');
      pdfDoc.fontSize(20).text('Total Price: ' + formatter.format(totalPrice));

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
