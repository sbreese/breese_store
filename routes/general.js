const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const generalController = require('../controllers/general');
const isAuth = require('../middleware/is-auth');

router.post('/contact-form', generalController.postContact);

router.get('/contact', [
    body('visitorEmail')
      .isEmail()
      .withMessage('Please enter a valid email address.'),
    body('visitorMsg')
      .isLength({ min: 5, max: 400 })
      .withMessage('Message must be between 5 and 400 characters')
      .trim()
], generalController.getContact);

module.exports = router;