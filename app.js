const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const multer = require('multer')
// const forceDomain = require('forcedomain')

const errorController = require('./controllers/error')
const shopController = require('./controllers/shop')
const isAuth = require('./middleware/is-auth')
const User = require('./models/user')

// const MONGODB_URI =
//  'mongodb+srv://maximilian:9u4biljMQc4jjqbe@cluster0-ntrwp.mongodb.net/shop';
// const MONGODB_URI =
//  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-ntrwp.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;
const MONGODB_URI = 'mongodb://breese:breese@ds059634.mongolab.com:59634/breese'

const app = express()

/*
app.use(forceDomain({
  hostname: 'www.breese.store'
}));*/

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
})
const csrfProtection = csrf()

// Removed new Date().toISOString() + '-' +  from filename
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

app.set('view engine', 'ejs')
app.set('views', 'views')

const productRoutes = require('./routes/products')
const categoryRoutes = require('./routes/categories')
const generalRoutes = require('./routes/general')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')
const orderRoutes = require('./routes/orders')
const usersRoutes = require('./routes/users')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(
  multer({storage: fileStorage, fileFilter: fileFilter}).array('images', 4) // .single('image')
)
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
)

app.use(flash())

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.user = req.session.user
  res.locals.orders = req.session.login_orders || []
  res.locals.cart_items =
    (req.session.user && req.session.user.cart.items) ||
    req.session.cart_items ||
    []

  next()
})

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next()
  }
  // User.findById(req.session.user._id)
  User.findOne({_id: req.session.user._id})
    .populate('cart.items.product')
    .then((user) => {
      if (!user) {
        return next()
      }
      req.user = user
      next()
    })
    .catch((err) => {
      next(new Error(err))
    })
})

app.post('/create-order', isAuth, shopController.postOrder)

app.use(csrfProtection)
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use('/admin', productRoutes)
app.use('/admin', categoryRoutes)
app.use('/admin', orderRoutes)
app.use('/admin', usersRoutes)
app.use(generalRoutes)
app.use(authRoutes)
app.use(shopRoutes)

app.get('/500', errorController.get500)

app.use(errorController.get404)

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    cart_total: 0,
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
    errorMsg: error,
  })
})

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(process.env.PORT || 3000)
  })
  .catch((err) => {
    console.log(err)
  })
