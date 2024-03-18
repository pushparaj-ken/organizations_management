var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const passport = require('./middleware/passport');
var organizationRouter = require('./routes/organization');
var usersRouter = require('./routes/users');
var rolesRouter = require('./routes/roles.js');
var AssessmentRouter = require('./routes/assessment.js');


const errorHandler = require('./utils/ApiError');
const decryptRequestBody = require('./middleware/Decrypt');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors({
  origin: 'http://localhost:3000' // Replace with your React app's origin
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  if (req.headers['content-type'] !== 'application/json') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      req.body = data;
      next();
    });
  } else {
    next();
  }
});

app.use((req, res, next) => {
  if (req.headers['content-type'] !== 'application/json' && req.headers['content-type'] !== undefined) {
    decryptRequestBody(req, res, next);
  } else {
    next();
  }
});
//Error Gobal
app.use(errorHandler);
// Routes
app.use('/api/organization', organizationRouter);
app.use('/api/users', usersRouter);
app.use('/api/role', rolesRouter);
app.use('/api/assessment', AssessmentRouter);

//decrypt response Body
// const encrption = require('./services/encrypt');
// secretHexKey = process.env.secretHexKey; // should
// const getTimestamp1 = () => {
//   let today = new Date();
//   let date = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
//   let time = ('0' + (today.getHours())).slice(-2) + ":" + ('0' + (today.getMinutes())).slice(-2);
//   return date + ' ' + time;
// }
// let timestamp1 = getTimestamp1();

// let data = {
//   "email": "sadmin@gmail.com",
//   "password": "123456"
// }
// const encOutput2 = encrption.encrypt((timestamp1 + JSON.stringify(data)), secretHexKey)

// console.log(encOutput2);

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
