var express = require('express');
var router = express.Router();
const AssessmentController = require('../Controllers/assessmentController');
const Auth = require('../middleware/auth');



/* GET home page. */

router.get('/list', Auth.AuthMiddleware, AssessmentController.ListAssessment);


router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
