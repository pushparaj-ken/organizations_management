var express = require('express');
var router = express.Router();
const organizationController = require('../Controllers/organizationController');
const Auth = require('../middleware/auth');



/* GET home page. */
router.post('/add', Auth.AuthMiddleware, organizationController.AddOrganization);

router.put('/update/:id', Auth.AuthMiddleware, organizationController.UpdateOrganization);

router.delete('/delete/:id', Auth.AuthMiddleware, organizationController.DeleteOrganization);

router.get('/list', Auth.AuthMiddleware, organizationController.ListOrganization);


router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
