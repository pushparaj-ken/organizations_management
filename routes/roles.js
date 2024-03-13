var express = require('express');
var router = express.Router();
const roleController = require('../Controllers/roleController');
const Auth = require('../middleware/auth');



/* GET home page. */
router.post('/add', Auth.AuthMiddleware, roleController.AddRole);

router.put('/update/:id', Auth.AuthMiddleware, roleController.UpdateRole);

router.delete('/delete/:id', Auth.AuthMiddleware, roleController.DeleteRole);

router.get('/list', Auth.AuthMiddleware, roleController.ListRole);


router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
