const Order = require('../models/order');

const ITEMS_PER_PAGE = 10;

exports.getAllOrders = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  const filterField = req.params.filterField;
  const filterValue = req.params.filterValue;
  const filterCondition = filterField && filterValue && { [filterField]: filterValue};

  Order.find(filterCondition)
    .countDocuments()
    .then(numOrders => {
      totalItems = numOrders;
      return Order.find(filterCondition)
        .populate('user')
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(orders => {
      res.render('orders/order-list', {
        orders,
        filterField,
        filterValue,
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

exports.getOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId).populate('user')
    .then(order => {
      if (order) {
        const productCt = order.products.length;
        const firstProdQty = order.products[0].quantity;
        console.log("Here is the raw order:");
        console.log(order, productCt, firstProdQty);
        res.render('orders/order-detail', {
          order,
          pageTitle: `Order for ${productCt} product${productCt > 1 ? 's' : ''}, including ${firstProdQty} ${order.products[0].product.title}${firstProdQty > 1 ? 's' : ''}`,
          path: '/admin/orders'
        });
      } else {
        res.redirect('/admin/orders');
      }
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('Order not found.'));
      }
      return Order.deleteOne({ _id: orderId });
    })
    .then(() => {
      console.log('DESTROYED ORDER');
      res.status(200).json({ message: 'Success!' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Deleting order failed.' });
    });
};

exports.shippedOrder = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
  .then(order => {
    order.fulfillment_status = order.fulfillment_status < 8 ? 8 : 0;
    return order.save().then(result => {
      console.log('MARKED AS SHIPPED!');
      res.status(200).json({ message: 'Success fully marked as shipped!' });
    });
  })
  .catch(err => {
    res.status(500).json({ message: 'Marking order as shipped failed.' });
  });
};