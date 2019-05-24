var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
const mongoose = require('mongoose')


var usersRouter = require('./api/routes/users');
var adminsRouter = require('./api/routes/admins');
var productsRouter = require('./api/routes/products');
var storesRouter = require('./api/routes/stores');
var offsRouter = require('./api/routes/offs');
var populationsRouter = require('./api/routes/populations');
var categoriesRouter = require('./api/routes/categories');

var app = express();
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/public',express.static('public'));
// This is test line for git
//var url = 'mongodb://localhost:27017/leafletapp';
var url = 'mongodb://127.0.0.1/leafletapp?authSource=admin'

mongoose.connect(
  url,{
    user:'ha.younes72',
    pass:'h@jnFV!@bY',
    useNewUrlParser: true,
    useCreateIndex: true
  }
).then(()=>{
  console.log('Connected to: '+url)
})


app.use('/products', productsRouter);
app.use('/users', usersRouter);
app.use('/admins/', adminsRouter);
app.use('/stores', storesRouter);
app.use('/offs', offsRouter);
app.use('/populations', populationsRouter);
app.use('/categories', categoriesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
