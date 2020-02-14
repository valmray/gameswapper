var express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');

var app = express();
var itemDB = require('../models/itemDB');
var userDB = require('../models/userDB');
var swapDB = require('../models/swapDB');

var Item = require('../models/item');
var User = require('../models/user');
var Profile = require('../models/userProfile');
var UserSwap = require('../models/userSwap');
var UserModel = userDB.user;
var ItemModel = itemDB.item;

var allItems = [];
var allSwaps = [];


var allUsers = [];


var session = require('express-session');

app.set('view engine', 'ejs');
app.use('/resources', express.static('../resources'));
app.use('/views', express.static('../views'));
app.use(session({secret: "secret-key"}));
app.use(cookieParser());

const bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var expressValidator = require('express-validator');

router.use(bodyParser.text());
router.use(urlencodedParser);
app.use(expressValidator);

const { check, validationResult } = require('express-validator/check');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

router.get('/login', [check('action').isAlpha().isLength({max: 10})], function(req, res)
{
  var qs = req.query;
  var sessData = req.session;
  const errors = validationResult(req);

  var msg = JSON.parse(JSON.stringify(errors.array()));
  console.log(msg);
  if(qs.action === "signout")
  {
    sessData.theUser = null;
    sessData.currentProfile = null;
    sessData.userSwapInfo = null;
  }

  if(sessData.theUser)
  {
    var user = sessData.theUser;
    res.render(path.resolve(__dirname, '../views') + '/login', {user: user, errors: {}});
  }
  else
  {
    res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors: {}});
  }
});


module.exports = router;
