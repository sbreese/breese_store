const ejs = require('ejs');
const { validationResult } = require('express-validator/check');
const shopController = require('../controllers/shop');
const helper = require('./helper');
const sendmail = require('sendmail')();

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

  const visitorName = req.body.visitorName;
  const visitorEmail = req.body.visitorEmail;
  const visitorMsg = req.body.visitorMsg;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Hmm, looks like there are some errors!");
    ejs.renderFile('/app/views/includes/contact-form.ejs', {
      contactSubmitSuccess: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        visitorName,
        visitorEmail,
        visitorMsg
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
      html: `<p>The following message was sent by &quot;${visitorName}&quot; &lt;${visitorEmail}&gt;</p>
<p>
=================================<br>
${visitorMsg}<br>
=================================<br>
<p>Kind regards,</p>
Steve Breese<br>
Founder<br>
www.Breese.Store`,
    }, (err, reply) => {
      if (err) {
        console.log("Oops, an error has occured:", err && err.stack);
      } else {
        // sendJSONresponse(res, 200,{ message: `Thanks ${req.body.name}. Your message has been sent to Fix-a-Drink administrators.` });
        ejs.renderFile('/app/views/includes/contact-form.ejs', {
          contactSubmitSuccess: true,
        }, {}, (err, contactForm) => {
    
          res.status(200).json({ message: 'Success!', contactForm });
        });
      }
    });
    // END mail()

    


  }

  // res.status(200).json({ message: 'Success!', contactForm: visitorEmail + 'nice!' + visitorMsg });

};