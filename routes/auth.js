const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/checkout-shipping-address', authController.getShippingAddress);

router.get('/confirm-information', authController.getConfirmInformation);

router.get('/edit-account', authController.getEditAccount);

// .normalizeEmail(), <-- This stupid function removes periods from emails
router.post(
  '/edit-account',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.'),
    body(
      'first_name',
      'First name is required.'
    )
    .isAlpha()
    .withMessage('Must be only alphabetical chars')
    .isLength({ min: 2 })
    .withMessage('Must be at least 2 chars long')
      .trim(),
    body(
      'last_name',
      'Last name is required.'
    )
    .isAlpha()
    .withMessage('Must be only alphabetical chars')
    .isLength({ min: 2 })
    .withMessage('Must be at least 2 chars long')
      .trim(),
    body(
      'address_line1',
      'Address Line 1 is required.'
    )
    .isLength({ min: 2 })
    .withMessage('Address Line 1 is required')
      .trim()
  ],
  authController.updateAccount
);

// .normalizeEmail(),
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.'),
    body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.post(
  '/delete-account',
  authController.deleteUser
);

// .normalizeEmail(),
router.post(
  '/checkout-shipping-address',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address if forbidden.');
        // }
        // return true;
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      }),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      }),
    body(
      'first_name',
      'First name is required.'
    )
    .isAlpha()
    .withMessage('Must be only alphabetical chars')
    .isLength({ min: 2 })
    .withMessage('Must be at least 2 chars long')
      .trim(),
    body(
      'last_name',
      'Last name is required.'
    )
    .isAlpha()
    .withMessage('Must be only alphabetical chars')
    .isLength({ min: 2 })
    .withMessage('Must be at least 2 chars long')
    .trim(),
    body(
      'address_line1',
      'Address is required.'
    )
    .isLength({ min: 2 })
    .withMessage('Must be at least 2 chars long')
    .trim(),
    body(
      'city',
      'City is required.'
    )
    .isLength({ min: 2 })
    .withMessage('Must be at least 2 chars long')
    .trim(),
    body(
      'state',
      'State is required.'
    )
    .isLength({ min: 2 })
    .withMessage('Must be at least 2 chars long')
    .trim(),
    body(
      'postalCode',
      'Postal Code is required.'
    )
    .isLength({ min: 2 })
    .withMessage('Must be at least 2 chars long')
    .trim(),
    body(
      'country',
      'Country is required.'
    )
    .isLength({ min: 2 })
    .withMessage('Must be at least 2 chars long')
    .trim()
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post(
  '/new-password', 
  [
    body('password', 'Password must be at least 5 characters in length and be letters and numbers.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postNewPassword
);

module.exports = router;
