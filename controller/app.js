var express = require('express');
const path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');


var app = express();
var itemDB = require('../models/itemDB');
var Item = require('../models/item');
var UserProfile = require('../models/userProfile');
var UserSwap = require('../models/userSwap');


app.set('view engine', 'ejs');
app.use('/resources', express.static('../resources'));
app.use('/views', express.static('../views'));

var Profile = require('./profileController');
var Category = require('./categoryController');
var MySwaps = require('./mySwapsController');
var MyCompletedSwaps = require('./mySwapHistoryController');
var Swap = require('./swapController');
var ItemCon = require('./itemController');
var Login = require('./loginController');
var SignUp = require('./signUpController');
var RateItem = require('./rateItemController');
var SwapRatings = require('./swapRatingsController');



app.use('/profileController', Profile);
app.use('/categoryController', Category);
app.use('/mySwapsController', MySwaps);
app.use('/mySwapHistoryController', MyCompletedSwaps);
app.use('/swapsController', Swap);
app.use('/itemController', ItemCon);
app.use('/loginController', Login);
app.use('/signUpController', SignUp);
app.use('/rateItemController', RateItem);
app.use('/swapRatingsController', SwapRatings);





app.use(session({secret: "secret-key"}));
app.use(cookieParser());

var allItems = [];
var allUsers = [];

var router = express.Router();
var mongoose = require('mongoose');

/*var expressValidator = require('express-validator');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(bodyParser.text());
app.use(urlencodedParser);
app.use(expressValidator);

const { check, validationResult } = require('express-validator/check');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');*/

app.use(async function (req, res, next) {
  //console.log('Request Type:', req.type);
  mongoose.connect('mongodb://localhost/gameswapper', function (err) {

     if (err) throw err;

     console.log('Successfully connected');

   });

  allItems = await itemDB.getAllItems();
  //allUsers = await userDB.getAllUsers();

  //JSON.parse(JSON.stringify(obj))

  next();
});


app.use(Profile, function (req, res, next) {
  //console.log('Request Type:', req.type);
  next();
});

app.use(SwapRatings, function (req, res, next) {
  //console.log('Request Type:', req.type);
  next();
});

app.use(MyCompletedSwaps, function (req, res, next) {
  //console.log('Request Type:', req.type);
  next();
});

app.use(RateItem, function (req, res, next) {
  //console.log('Request Type:', req.type);
  next();
});

app.use(Category, function (req, res, next) {
  //console.log('Request Type:', req.type);
  next();
});

app.use(MySwaps, function (req, res, next) {
  //console.log('Request Type:', req.type);
  next();
});

app.use(Swap, function (req, res, next) {
  //console.log('Request Type:', req.type);
  next();
});

app.use(ItemCon, function (req, res, next) {
  //console.log('Request Type:', req.type);
  next();
});

app.use(Login, function (req, res, next) {
  //console.log('Request Type:', req.type);
  next();
});

app.use(SignUp, function (req, res, next) {
  //console.log('Request Type:', req.type);
  next();
});

app.get('/', async function(req, res)
{
  var sessData = req.session;
  //console.log(allItems[0]);
  //console.log(await itemDB.getItem(2));
  var qs = req.query;
  if(sessData.theUser)
  {
    var user = sessData.theUser;
    res.render(path.resolve(__dirname, '../views') + '/index', {user: user});
  }
  else
  {
    res.render(path.resolve(__dirname, '../views') + '/index', {user: ""});
  }
});

app.get('/index', function(req, res)
{
    var sessData = req.session;


    if(sessData.theUser)
    {
      var user = sessData.theUser;
      res.render(path.resolve(__dirname, '../views') + '/index', {user: user});
    }
    else
    {
      res.render(path.resolve(__dirname, '../views') + '/index', {user: ""});
    }
});

app.get('/about', function(req, res)
{
  var sessData = req.session;


  if(sessData.theUser)
  {
    var user = sessData.theUser;
    res.render(path.resolve(__dirname, '../views') + '/about', {user: user});
  }
  else
  {
    res.render(path.resolve(__dirname, '../views') + '/about', {user: ""});
  }
});

app.get('/cart', function(req, res)
{
  var sessData = req.session;


  if(sessData.theUser)
  {
    var user = sessData.theUser;
    res.render(path.resolve(__dirname, '../views') + '/cart', {user: user});
  }
  else
  {
    res.render(path.resolve(__dirname, '../views') + '/cart', {user: ""});
  }
});

app.get('/store', function(req, res)
{
  var sessData = req.session;


  if(sessData.theUser)
  {
    var user = sessData.theUser;
    res.render(path.resolve(__dirname, '../views') + '/store', {user: user});
  }
  else
  {
    res.render(path.resolve(__dirname, '../views') + '/store', {user: ""});
  }
});

app.get('/contact', function(req, res)
{
  var qs = req.query;
  var sessData = req.session;


  if(sessData.theUser)
  {
    var user = sessData.theUser;
    res.render(path.resolve(__dirname, '../views') + '/contact', {user: user});
  }
  else
  {
    res.render(path.resolve(__dirname, '../views') + '/contact', {user: ""});
  }
});

//the line below hangs up the website - consider putting signIn in different file
//app.use(expressValidator);



app.listen(8080);
