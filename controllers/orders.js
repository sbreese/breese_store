const Order = require('../models/order');

const ITEMS_PER_PAGE = 10;

exports.getAllOrders = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Order.find()
    .countDocuments()
    .then(numOrders => {
      totalItems = numOrders;
      return Order.find()
        .populate('user')
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(orders => {
      res.render('orders/order-list', {
        orders,
        pageTitle: 'Orders',
        path: '/admin/orders',
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