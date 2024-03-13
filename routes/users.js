var express = require('express');
var router = express.Router();
const usersController = require('../Controllers/userController');
const Auth = require('../middleware/auth');

/* GET users listing. */

router.post('/register', Auth.AuthMiddleware, usersController.Register);

router.post('/login', usersController.Login);

router.put('/update/:id', Auth.AuthMiddleware, usersController.UpdateUsers);

router.delete('/delete/:id', Auth.AuthMiddleware, usersController.DeleteUsers);

router.get('/list', Auth.AuthMiddleware, usersController.ListAllUsers);

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
