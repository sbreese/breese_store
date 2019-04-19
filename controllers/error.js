const helper = require('./helper');

exports.get404 = (req, res, next) => {
  helper.getShoppingCartData(req)
    .then(user_cart => {
      res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        path: '/404',
        cart_items: user_cart.cart_items,
        cart_total: user_cart.cart_total,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.get500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
};

/* ORIGINAL:
exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    path: '/404',
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
};
*/