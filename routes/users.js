const express = require('express');
const { body } = require('express-validator/check');
const router = express.Router();
const usersController = require('../controllers/users');
const isAuth = require('../middleware/is-auth');

// /admin/users/:userId => GET
router.get('/users/:userId/edit', isAuth, usersController.getEditUser);

// /admin/users/:userId => GET
router.get('/users/:userId', isAuth, usersController.getUser);

// /admin/users => GET
router.get('/users', isAuth, usersController.getUsers);

// /admin/user => DELETE
router.delete('/user/:userId', isAuth, usersController.deleteUser);

router.post('/contact-form', [
    body('visitorEmail')
      .isEmail()
      .withMessage('Please enter a valid email address.'),
    body('visitorMsg')
      .isLength({ min: 5, max: 400 })
      .withMessage('Message must be between 5 and 400 characters')
      .trim()
],
usersController.postContact);

module.exports = router;