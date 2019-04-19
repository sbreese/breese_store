const ejs = require('ejs');
const { validationResult } = require('express-validator/check');
const sendmail = require('sendmail')();

const shopController = require('../controllers/shop');
const helper = require('./helper');
const Message = require('../models/message');

exports.getContact = (req, res, next) => {

  shopController.getShoppingCartData(req)
    .then(user_cart => {
    res.render('newDesign/contact', {
      contactSubmitSuccess: false,
      errorMessage: null,
      validationErrors: [],
      oldInput: {
        name: '',
        email: '',
        message: ''
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

  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Hmm, looks like there are some errors!");
    ejs.renderFile('/app/views/includes/contact-form.ejs', {
      contactSubmitSuccess: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name,
        email,
        message
      },
      validationErrors: errors.array(),
      csrfToken: req.csrfToken(),
    }, {}, (err, contactForm) => {

      res.status(200).json({ message: 'Error!', contactForm });
    });
  } else {

    // BEGIN mail()
    sendmail({
      from: 'no-reply@breese.store',
      to: 'sbreese@gmail.com',
      subject: 'Message submitted on Breese.Store',
      html: `<p>The following message was sent by &quot;${name}&quot; &lt;${email}&gt;</p>
<p>
=================================<br>
${message}<br>
=================================<br>
<p>Kind regards,</p>
Steve Breese<br>
Founder<br>
www.Breese.Store`,
    }, (err, reply) => {
      if (err) {
        console.log("Oops, an error has occured:", err && err.stack);
      } else {
        ejs.renderFile('/app/views/includes/contact-form.ejs', {
          contactSubmitSuccess: true,
        }, {}, (err, contactForm) => {

          ///////////////////////////
          const messageDocument = new Message({
            name,
            email,
            message
          });
  
          return messageDocument.save().then(result => {
            console.log('MARKED AS SHIPPED!');
            res.status(200).json({ message: 'Success!', contactForm });
          });
          ///////////////////////////
          
        });
      }
    });
    // END mail()

    


  }

  // res.status(200).json({ message: 'Success!', contactForm: email + 'nice!' + message });

};