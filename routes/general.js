const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const generalController = require('../controllers/general');
// const isAuth = require('../middleware/is-auth');

router.post('/contact-form', [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.'),
    body('message')
      .isLength({ min: 5, max: 400 })
      .withMessage('Message must be between 5 and 400 characters')
      .trim()
], generalController.postContact);

router.get('/contact', generalController.getContact);
router.get('/about', generalController.getAbout);

module.exports = router;