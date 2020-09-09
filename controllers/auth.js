const crypto = require('crypto')

const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const {validationResult} = require('express-validator/check')

const User = require('../models/user')
const helper = require('./helper')

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        process.env.SENDGRID_API_KEY
    }
  })
)

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  const cart_items = req.session.cart_items || []
  const wishlist = req.session.wishlist || []
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    cart_items,
    cart_total: helper.sumPropertyValue(cart_items, 'quantity'),
    totalSum: helper.calcTotalPrice(cart_items),
    wishlist,
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  })
}

exports.getCreateUserAccount = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }

  const cart_items = req.session.cart_items || []
  const wishlist = req.session.wishlist || []
  res.render('auth/checkout-shipping-address', {
    path: '/checkout-shipping-address',
    pageTitle: cart_items.length ? 'Checkout - Customer Information' : 'Create User Account',
    cart_items,
    cart_total: helper.sumPropertyValue(cart_items, 'quantity'),
    totalSum: helper.calcTotalPrice(cart_items),
    wishlist,
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  })
}

exports.getShippingAddress = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }

  helper.getShoppingCartData(req)
    .then(user_cart => {
      console.log("Here is weird shopping cart:")
      console.log(user_cart)
      res.render('auth/checkout-shipping-address', {
        path: '/checkout-shipping-address',
        pageTitle: user_cart.cart_items.length ? 'Checkout - Shipping Information' : 'Create User Account',
        cart_items: user_cart.cart_items,
        cart_total: user_cart.cart_total,
        totalSum: helper.calcTotalPrice(user_cart.cart_items),
        wishlist: user_cart.wishlist,
        errorMessage: message,
        oldInput: {
          email: '',
          password: '',
          confirmPassword: ''
        },
        validationErrors: []
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getEnterNewPassword = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/enter-new-password', {
    path: '/enter-new-password',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      password: ''
    },
    validationErrors: []
  })
}

exports.getEditAccount = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      const cart_items = user.cart.items
      const wishlist = user.cart.wishlist
      res.render('auth/edit-account', {
        path: '/edit-account',
        pageTitle: 'Edit Account',
        cart_items,
        cart_total: helper.sumPropertyValue(cart_items, 'quantity'),
        totalSum: helper.calcTotalPrice(cart_items),
        wishlist,
        errorMessage: message,
        oldInput: {
          access_level: req.user.access_level,
          email: req.user.email,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          address_line1: req.user.address_line1,
          address_line2: req.user.address_line2,
          city: req.user.city,
          state: req.user.state,
          postalCode: req.user.postalCode,
          country: req.user.country
        },
        validationErrors: []
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getConfirmInformation = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }

  req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
      const cart_items = user.cart.items
      const wishlist = user.cart.wishlist
      res.render('auth/edit-account', {
        path: '/confirm-information',
        pageTitle: 'Confirm Your Information',
        cart_items,
        cart_total: helper.sumPropertyValue(cart_items, 'quantity'),
        totalSum: helper.calcTotalPrice(cart_items),
        wishlist,
        errorMessage: message,
        oldInput: {
          access_level: req.user.access_level,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          address_line1: user.address_line1,
          address_line2: user.address_line2,
          city: user.city,
          state: user.state,
          postalCode: user.postalCode,
          country: user.country
        },
        validationErrors: []
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })

}

exports.updateAccount = (req, res, next) => {
  const email = req.body.email
  const first_name = req.body.first_name
  const last_name = req.body.last_name
  const address_line1 = req.body.address_line1
  const address_line2 = req.body.address_line2
  const city = req.body.city
  const state = req.body.state
  const postalCode = req.body.postalCode
  const country = req.body.country

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.array())

    req.user
      .populate('cart.items.product')
      .execPopulate()
      .then(user => {
        const cart_items = user.cart.items
        const wishlist = user.cart.wishlist
        return res.status(422).render(req.body.other_user_id ? 'auth/edit-anothers-account' : 'auth/edit-account', {
          path: req.body.other_user_id ? '/edit-anothers-account' : '/edit-account',
          pageTitle: 'Edit Account',
          cart_items,
          cart_total: helper.sumPropertyValue(cart_items, 'quantity'),
          totalSum: helper.calcTotalPrice(cart_items),
          wishlist,
          errorMessage: errors.array()[0].msg,
          oldInput: {
            _id: req.body.other_user_id ? req.body.other_user_id : '',
            email,
            first_name,
            last_name,
            address_line1,
            address_line2,
            city,
            state,
            postalCode,
            country
          },
          validationErrors: errors.array()
        })

      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
  }

  User.findOne({_id: req.body.other_user_id ? req.body.other_user_id : req.session.user._id})
    .populate('cart.items.product')
    .then(user => {
      user.email = email
      user.first_name = first_name
      user.last_name = last_name
      user.address_line1 = address_line1
      user.address_line2 = address_line2
      user.city = city
      user.state = state
      user.postalCode = postalCode
      user.country = country
      return user.save()
    })
    .then(result => {
      if (req.body.other_user_id) {
        res.redirect(`/admin/users/${req.body.other_user_id}`)
      } else {
        req.session.user.email = email
        req.session.user.first_name = first_name
        req.session.user.last_name = last_name
        req.session.user.address_line1 = address_line1
        req.session.user.address_line2 = address_line2
        req.session.user.city = city
        req.session.user.state = state
        req.session.user.postalCode = postalCode
        req.session.user.country = country
        if (req.body.checkout) {
          res.redirect('/checkout')
        } else {
          res.redirect('/')
        }
      }
      // return transporter.sendMail({
      //   to: email,
      //   from: 'shop@node-complete.com',
      //   subject: 'Signup succeeded!',
      //   html: '<h1>You successfully signed up!</h1>'
      // });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

const Order = require('../models/order')
exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  console.log("User is wishing to login with the following credentials!")
  console.log(email)
  console.log(password)

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const cart_items = req.session.cart_items || []
    const wishlist = req.session.wishlist || []
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      cart_items,
      wishlist,
      cart_total: helper.sumPropertyValue(cart_items, 'quantity'),
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    })
  }

  User.findOne({email})
    .populate('cart.items.product')
    .then(user => {
      console.log("Resulting findOne user:")
      console.log(user)

      if (!user) {
        const cart_items = req.session.cart_items || []
        const wishlist = req.session.wishlist || []
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          cart_items,
          wishlist,
          cart_total: helper.sumPropertyValue(cart_items, 'quantity'),
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email,
            password
          },
          validationErrors: []
        })
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            console.log("Hey, the passwords do match!")
            console.log(user)
            return user
          } else {
            console.log("Hey, the password " + password + " DOESN'T match!")
            console.log(user)
            const cart_items = req.session.cart_items || []
            const wishlist = req.session.wishlist || []
            return res.status(422).render('auth/login', {
              path: '/login',
              pageTitle: 'Login',
              cart_items,
              wishlist,
              cart_total: helper.sumPropertyValue(cart_items, 'quantity'),
              errorMessage: 'Invalid email or password.',
              oldInput: {
                email,
                password
              },
              validationErrors: []
            })
          }
        })
        .then(user => {
          console.log("Are we getting here?  What for?")
          console.log(user)
          if (user) {
            if (req.session.cart_items && req.session.cart_items.length) {
              // de-duplicate cart items
              user.cart.items = [...req.session.cart_items, ...user.cart.items].filter((thing, index, self) => self.findIndex(t => t.product._id.toString() === thing.product._id.toString()) === index)
              req.session.cart_items = []
              user.save()
            }
            if (req.session.wishlist && req.session.wishlist.length) {
              // de-duplicate wishlist
              user.cart.wishlist = [...req.session.wishlist, ...user.cart.wishlist].filter((thing, index, self) => self.findIndex(t => t._id.toString() === thing._id.toString()) === index)
              req.session.wishlist = []
              user.save()
            }

            return user
          }
        })
        .then(user => {
          if (user) {
            // steves additions
            Order.find({'user.userId': user._id})
              .then(orders => {
                req.session.isLoggedIn = true
                req.session.user = user
                req.session.login_orders = orders

                return req.session.save(err => {
                  console.log(err)
                  res.redirect(user.cart.items.length > 0 ? '/shopping-cart' : '/')
                })

              })
              .catch(err => {
                console.log(err)
                res.redirect('/login')
              })
            // end steves addition
          }
        })
        .catch(err => {
          console.log(err)
          res.redirect('/login')
        })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const first_name = req.body.first_name
  const last_name = req.body.last_name
  const address_line1 = req.body.address_line1
  const address_line2 = req.body.address_line2
  const city = req.body.city
  const state = req.body.state
  const postalCode = req.body.postalCode
  const country = req.body.country

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.array())
    const cart_items = req.session.cart_items
    return res.status(422).render('newDesign/checkout-shipping-address', {
      path: '/checkout-shipping-address',
      pageTitle: 'Shipping Information',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password: '',
        confirmPassword: '',
        first_name,
        last_name,
        address_line1,
        address_line2,
        city,
        state,
        postalCode,
        country
      },
      cart_items,
      cart_total: helper.sumPropertyValue(cart_items, 'quantity'),
      totalSum: helper.calcTotalPrice(cart_items),
      wishlist: req.session.wishlist ? req.session.wishlist : [],
      validationErrors: errors.array()
    })
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email,
        password: hashedPassword,
        first_name,
        last_name,
        address_line1,
        address_line2,
        city,
        state,
        postalCode,
        country,
        cart: {
          items: req.session.cart_items ? req.session.cart_items : [],
          wishlist: req.session.wishlist ? req.session.wishlist : []
        },
        access_level: 1
      })
      return user.save()
    })
    .then(user => {

      console.log("Here is user:", user)
      // steves additions            
      req.session.isLoggedIn = true
      req.session.user = user
      req.session.wishlist = []

      let signUpRedirect = '/'
      if (req.session.cart_items && req.session.cart_items.length) {
        req.session.cart_items = []
        signUpRedirect += 'checkout'
      }

      return req.session.save(err => {
        console.log(err)
        res.redirect(signUpRedirect)
      })
      // end steves addition

      // res.redirect('/login'); <-- Steve commented out
      // return transporter.sendMail({
      //   to: email,
      //   from: 'shop@node-complete.com',
      //   subject: 'Signup succeeded!',
      //   html: '<h1>You successfully signed up!</h1>'
      // });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err)
    res.redirect('/')
  })
}

exports.getReset = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  })
}

exports.postReset = (req, res, next) => {
  // localhost:3000
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex')
    User.findOne({email: req.body.email})
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.')
          return res.redirect('/reset')
        }
        user.passwordResetToken = token
        user.passwordResetExpires = Date.now() + 3600000
        return user.save()
      })
      .then(result => {
        res.redirect('/')
        transporter.sendMail({
          to: req.body.email,
          from: process.env.FROM_EMAIL,
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="https://${req.get('host')}/reset/${token}">link</a> to set a new password.</p>
          `
        })
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token
  User.findOne({passwordResetToken: token, passwordResetExpires: {$gt: Date.now()}})
    .then(user => {
      let message = req.flash('error')
      if (message.length > 0) {
        message = message[0]
      } else {
        message = null
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        oldInput: {
          password: '',
          passwordToken: '',
          userId: ''
        },
        validationErrors: [],
        userId: user._id.toString(),
        passwordToken: token
      })
    })
    .catch(err => {
      const error = new Error(err)
      console.log("Here is the error Steve 1:")
      console.log(error)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password
  const userId = req.body.userId
  const passwordToken = req.body.passwordToken


  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('auth/enter-new-password', {
      path: '/enter-new-password',
      pageTitle: 'Enter Valid Password',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        password: newPassword,
        userId: userId,
        passwordToken: passwordToken
      },
      validationErrors: errors.array()
    })
  }

  let resetUser

  User.findOne({
    passwordResetToken: passwordToken,
    passwordResetExpires: {$gt: Date.now()},
    _id: userId
  })
    .then(user => {
      resetUser = user
      return bcrypt.hash(newPassword, 12)
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword
      resetUser.passwordResetToken = undefined
      resetUser.passwordResetExpires = undefined
      return resetUser.save()
    })
    .then(result => {
      res.redirect('/login')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      console.log("Here is the error Steve 2:")
      console.log(error)
      return next(error)
    })

}

exports.deleteUser = (req, res, next) => {

  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next(new Error('User not found.'))
      }
      return User.deleteOne({_id: req.session.user._id})
    })
    .then(() => {
      console.log('DELETED USER')
      req.session.destroy(err => {
        console.log(err)
        res.redirect('/')
      })
    })
    .catch(err => {
      res.status(500).json({message: 'Deleting user failed.'})
    })
}