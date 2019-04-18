const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const generalController = require('../controllers/general');
const isAuth = require('../middleware/is-auth');

router.post('/contact-form', generalController.postContact);

router.get('/contact', generalController.getContact);

module.exports = router;