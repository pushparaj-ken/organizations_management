var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const passport = require('./middleware/passport');
var organizationRouter = require('./routes/organization');
var usersRouter = require('./routes/users');
var rolesRouter = require('./routes/roles.js');


const errorHandler = require('./utils/ApiError');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/organization', organizationRouter);
app.use('/api/users', usersRouter);
app.use('/api/role', rolesRouter);

//Error Gobal
app.use(errorHandler);
//Database Connection
mongoose.connect(process.env.MONGO_ADDRESS);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const errcode = new Error("Not Found.");
  errcode.statusCode = 404;
  console.log("TCL: err", 404)
  return next(errcode);
});

app.use(function (err, req, res, next) {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    code: statusCode,
    message: err.message || 'Internal Server Error',
    timestamp: new Date()
  });
});

module.exports = app;
