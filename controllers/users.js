const User = require('../models/user');

const ITEMS_PER_PAGE = 10;

exports.getUsers = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  User.find()
    .countDocuments()
    .then(numUsers => {
      totalItems = numUsers;
      return User.find()
        .populate('orders')
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(users => {
      console.log("We did it!");
      console.log(users);
      res.render('auth/user-list', {
        users,
        pageTitle: 'Users',
        path: '/users',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      console.log("OOPS, an error:");
      console.log(error);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findById(userId)
    .then(user => {
      if (!user) {
        return next(new Error('Order not found.'));
      }
      return User.deleteOne({ _id: userId });
    })
    .then(() => {
      console.log('DELETED USER');
      res.status(200).json({ message: 'Success!' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Deleting user failed.' });
    });
};