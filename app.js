var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dbConnect=require('./config/connection')
const session= require('express-session')
const nocache=require('nocache')
const bcrypt= require('bcrypt')
const multer=require('multer')

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
const expressLayout = require('express-ejs-layouts')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayout)
app.use(nocache());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use('imgs',express.static(path.join(__dirname, 'imgs')));
//app.use(multer({desc:'items',}).single('image'));
dbConnect();

app.use(session({
  secret: 'keyboard cat',
  key: 'user_id',
  resave: false,
  saveUninitialized : false,
  cookie : {
    maxAge : 60000000
  }
}));

app.use('/admin', adminRouter);
app.use('/', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res) {
  // next(createError(404));
  res.render('error')
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
