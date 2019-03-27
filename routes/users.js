const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const isAuth = require('../middleware/is-auth');

router.get('/users', isAuth, usersController.getUsers);
router.delete('/user/:userId', isAuth, usersController.deleteUser);

module.exports = router;