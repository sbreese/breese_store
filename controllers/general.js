const ejs = require('ejs')
const {validationResult} = require('express-validator/check')
const sendmail = require('sendmail')()

const helper = require('./helper')
const Message = require('../models/message')
const Newsletter = require('../models/newsletter')

exports.getContact = (req, res, next) => {

  helper.getShoppingCartData(req)
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
        cart_total: typeof user_cart === 'object' && 'cart_total' in user_cart ? user_cart.cart_total : 0,
        totalSum: helper.calcTotalPrice(user_cart.cart_items),
        wishlist: user_cart.wishlist,
        csrfToken: req.csrfToken(),
        pageTitle: 'Breese.Store &mdash; Contact Steve Breese',
        path: '/contact'
      }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postContact = (req, res, next) => {

  const name = req.body.name
  const email = req.body.email
  const message = req.body.message

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log("Hmm, looks like there are some errors!")
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

      res.status(200).json({message: 'Error!', contactForm})
    })
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
        console.log("Oops, an error has occured:", err && err.stack)
      } else {
        ejs.renderFile('/app/views/includes/contact-form.ejs', {
          contactSubmitSuccess: true,
        }, {}, (err, contactForm) => {

          ///////////////////////////
          const messageDocument = new Message({
            name,
            email,
            message
          })

          return messageDocument.save().then(result => {
            console.log('MARKED AS SHIPPED!')
            res.status(200).json({message: 'Success!', contactForm})
          })
          ///////////////////////////

        })
      }
    })
    // END mail()
  }
}

exports.postNewsletter = (req, res, next) => {

  const email = req.body.email

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    ejs.renderFile('/app/views/includes/newsletter-signup.ejs', {
      newsletterSubmitSuccess: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email
      },
      validationErrors: errors.array(),
      csrfToken: req.csrfToken(),
    }, {}, (err, newsletterForm) => {

      res.status(200).json({message: 'Error!', newsletterForm})
    })
  } else {

    ejs.renderFile('/app/views/includes/contact-form.ejs', {
      contactSubmitSuccess: true,
    }, {}, (err, newsletterForm) => {

      ///////////////////////////
      const newsletterDocument = new Newsletter({
        email
      })

      return newsletterDocument.save().then(result => {
        res.status(200).json({message: 'Success!', newsletterForm})
      })
      ///////////////////////////

    })
  }
}

exports.getAbout = (req, res, next) => {

  helper.getShoppingCartData(req)
    .then(user_cart => {
      res.render('newDesign/about', {
        cart_items: user_cart.cart_items,
        cart_total: typeof user_cart === 'object' && 'cart_total' in user_cart ? user_cart.cart_total : 0,
        totalSum: helper.calcTotalPrice(user_cart.cart_items),
        wishlist: user_cart.wishlist,
        pageTitle: 'About Breese.Store',
        path: '/about'
      }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getHelpFaqs = (req, res, next) => {

  helper.getShoppingCartData(req)
    .then(user_cart => {
      res.render('newDesign/help_faqs', {
        cart_items: user_cart.cart_items,
        cart_total: typeof user_cart === 'object' && 'cart_total' in user_cart ? user_cart.cart_total : 0,
        totalSum: helper.calcTotalPrice(user_cart.cart_items),
        wishlist: user_cart.wishlist,
        pageTitle: 'Breese.Store &mdash; Help & FAQs',
        path: '/help_faqs'
      }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getBlog = (req, res, next) => {

  helper.getShoppingCartData(req)
    .then(user_cart => {
      res.render('newDesign/blog', {
        cart_items: user_cart.cart_items,
        cart_total: typeof user_cart === 'object' && 'cart_total' in user_cart ? user_cart.cart_total : 0,
        totalSum: helper.calcTotalPrice(user_cart.cart_items),
        wishlist: user_cart.wishlist,
        pageTitle: 'Blog',
        path: '/blog'
      }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })

}

exports.getBlogDetail = (req, res, next) => {

  helper.getShoppingCartData(req)
    .then(user_cart => {
      res.render('newDesign/blog-detail', {
        cart_items: user_cart.cart_items,
        cart_total: typeof user_cart === 'object' && 'cart_total' in user_cart ? user_cart.cart_total : 0,
        totalSum: helper.calcTotalPrice(user_cart.cart_items),
        wishlist: user_cart.wishlist,
        pageTitle: 'Breese.Store &mdash; Blog Detail',
        path: '/blog-detail'
      }).catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}