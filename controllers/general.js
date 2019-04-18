const ejs = require('ejs');
const { validationResult } = require('express-validator/check');
const shopController = require('../controllers/shop');
const helper = require('./helper');

exports.getContact = (req, res, next) => {

  shopController.getShoppingCartData(req)
    .then(user_cart => {
    res.render('newDesign/contact', {
      contactSubmitSuccess: false,
      errorMessage: null,
      validationErrors: [],
      oldInput: {
        visitorEmail: '',
        visitorMsg: ''
      },
      cart_items: user_cart.cart_items,
      cart_total: user_cart.cart_total,
      totalSum: helper.calcTotalPrice(user_cart.cart_items),
      wishlist: user_cart.wishlist,
      csrfToken: req.csrfToken(),
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

exports.postContact = (req, res, next) => {
  console.log("Got here, yippee!");
  const visitorEmail = req.body.visitorEmail;
  const visitorMsg = req.body.visitorMsg;
  console.log(req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Hmm, looks like there are some errors!");
    ejs.renderFile('/app/views/includes/contact-form.ejs', {
      contactSubmitSuccess: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        visitorEmail,
        visitorMsg
      },
      validationErrors: errors.array(),
      csrfToken: req.csrfToken(),
    }, {}, (err, contactForm) => {

      res.status(200).json({ message: 'Error!', contactForm });
    });
  }

  // res.status(200).json({ message: 'Success!', contactForm: visitorEmail + 'nice!' + visitorMsg });

};