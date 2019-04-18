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

      res.render('users/user-list', {
        users,
        pageTitle: 'Users',
        path: '/admin/users',
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

exports.getUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findById(userId).populate('orders')
    .then(user => {
      res.render('users/user-detail', {
        user: user,
        pageTitle: `${user.first_name} ${user.last_name}`,
        path: '/admin/users'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditUser = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  const userId = req.params.userId;
  User.findById(userId).populate('orders')
    .then(user => {

      console.log("Admin is now editing another user's account:");
      console.log(user);

    res.render('auth/edit-anothers-account', {
      path: '/edit-anothers-account',
      pageTitle: "Edit Another's Account",
      errorMessage: message,
      oldInput: user,
      validationErrors: []
    });

  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.deleteUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findById(userId)
    .then(user => {
      if (!user) {
        return next(new Error('User not found.'));
      }
      if (user.access_level > 5) {
        return next(new Error('Admin accounts cannot be deleted through the UI.'));
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

exports.postContact = (req, res, next) => {

  const visitorEmail = req.body.visitorEmail;
  const visitorMsg = req.body.visitorMsg;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        visitorEmail,
        visitorMsg
      },
      validationErrors: errors.array()
    });
  }

  if (!visitorEmail || ) {
      return res.status(400).send({ error:true, message: 'Please provide task' });
  }

  //var task = req.body.task;

  var query = mc.query("INSERT INTO tasks SET ? ", { task: task}, function (error, results, fields) {
      if (error) throw error;
      console.log(task);
      return res.send({ error: false, data: results, message: 'New task has been created successfully.' });
  });

};