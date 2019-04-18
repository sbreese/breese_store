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

router.post('/contact-form', usersController.postContact);

router.get('/contact', shopController.getContact);

module.exports = router;