const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const isAuth = require('../middleware/is-auth');

// /admin/users => GET
router.get('/users', isAuth, usersController.getUsers);
// /admin/users/:userId => GET
router.get('/users/:userId', isAuth, usersController.getUsers);
// /admin/user => DELETE
router.delete('/user/:userId', isAuth, usersController.deleteUser);

module.exports = router;