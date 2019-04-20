const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const generalController = require('../controllers/general');
// const isAuth = require('../middleware/is-auth');

router.post('/contact-form', [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .trim(),
    body('message')
      .isLength({ min: 5, max: 400 })
      .withMessage('Message must be between 5 and 400 characters')
      .trim()
], generalController.postContact);

router.post('/newsletter-form', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .trim()
], generalController.postNewsletter);

router.get('/contact', generalController.getContact);
router.get('/about', generalController.getAbout);
router.get('/help_faqs', generalController.getHelpFaqs);
router.get('/blog', generalController.getBlog);
router.get('/blog-detail', generalController.getBlogDetail);

module.exports = router;