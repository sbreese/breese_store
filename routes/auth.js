const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/profile', authController.getProfile);

// .normalizeEmail(), <-- This stupid function removes periods from emails
router.post(
  '/profile',
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
      .trim()
  ],
  authController.updateProfile
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
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
      })
      .normalizeEmail(),
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

const isAuth = require('../middleware/is-auth');
router.get('/admin/users', isAuth, authController.getUsers);

module.exports = router;
