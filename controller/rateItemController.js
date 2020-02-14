var express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var expressSanitizer = require('express-sanitizer');

var app = express();
var itemDB = require('../models/itemDB');
var userDB = require('../models/userDB');
var swapDB = require('../models/swapDB');
var offerDB = require('../models/offerDB');

var Item = require('../models/item');
var User = require('../models/user');
var Profile = require('../models/userProfile');
var UserSwap = require('../models/userSwap');
var UserModel = userDB.user;
var ItemModel = itemDB.item;
var SwapModel = swapDB.swap;
var OfferModel = offerDB.offer;


var allItems = [];
var allOffers = [];

//var allUsers = [];
var session = require('express-session');

app.set('view engine', 'ejs');
app.use('/resources', express.static('../resources'));
app.use('/views', express.static('../views'));
app.use(session({secret: "secret-key"}));
app.use(cookieParser());
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var router = express.Router();
var expressValidator = require('express-validator');

router.use(bodyParser.text());
router.use(urlencodedParser);
app.use(expressValidator);

const { check, validationResult } = require('express-validator/check');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var mongoSanitize = require('express-mongo-sanitize');


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(mongoSanitize());

app.use(expressSanitizer());
router.use(expressSanitizer());


router.use(async function (req, res, next) {
  //console.log('Request Type:', req.type);
  mongoose.connect('mongodb://localhost/gameswapper', function (err) {

     if (err) throw err;

     console.log('Successfully connected');

   });

   var allItemsSanitize = JSON.parse(JSON.stringify(await itemDB.getAllItems()));

   for (var i = 0; i < allItemsSanitize.length; i++) {
     allItemsSanitize[i].name = req.sanitize(allItemsSanitize[i].name);
     allItemsSanitize[i].code = req.sanitize(allItemsSanitize[i].code);
     allItemsSanitize[i].category = req.sanitize(allItemsSanitize[i].category);
     allItemsSanitize[i].description = req.sanitize(allItemsSanitize[i].description);
     allItemsSanitize[i].rating = req.sanitize(allItemsSanitize[i].rating);
     allItemsSanitize[i].imageUrl = req.sanitize(allItemsSanitize[i].imageUrl);


   }

   allItems = JSON.parse(JSON.stringify(allItemsSanitize));
  //allUsers = await userDB.getAllUsers();
   var allOffersSanitize = [];
   allOffersSanitize = JSON.parse(JSON.stringify(await offerDB.getAllOffers()));


   for (var i = 0; i < allOffersSanitize.length; i++) {
     allOffersSanitize[i].userID = req.sanitize(allOffersSanitize[i].userID);
     allOffersSanitize[i].itemCodeOwn = req.sanitize(allOffersSanitize[i].itemCodeOwn);
     allOffersSanitize[i].itemCodeWant = req.sanitize(allOffersSanitize[i].itemCodeWant);
     allOffersSanitize[i].itemStatus = req.sanitize(allOffersSanitize[i].itemStatus);
   }

   allOffers = JSON.parse(JSON.stringify(allOffersSanitize));


  next();
});

var itemCodeValid = false;
var theItemValid = false;
var itemC = {};
var itemCT = {};


router.get('/rateItem', [check('itemCode').custom((value, { req }) => {
  return ItemModel.find({code: req.query.itemCode}).then(item => {

    if(item.length > 0)
    {
      itemCodeValid = true;
      itemC = item[0];


      itemC.name = req.sanitize(itemC.name);
      itemC.code = req.sanitize(itemC.code);
      itemC.category = req.sanitize(itemC.category);
      itemC.description = req.sanitize(itemC.description);
      itemC.rating = req.sanitize(itemC.rating);
      itemC.imageUrl = req.sanitize(itemC.imageUrl);



      console.log("Item is valid");
    }
    else
    {
      itemCodeValid = false;

      console.log("Item is invalid")
      return Promise.reject('Item is invalid');
    }
  });
})], function(req, res)
{
  var sessData = req.session;
  var qs = req.query;

  if(sessData.theUser)
  {
    var user = sessData.theUser;

    if(qs.itemCode != null && qs.itemCode !== "")
    {
      if(itemCodeValid)
      {
        res.render(path.resolve(__dirname, '../views') + '/rateItem', {user: user, item: itemC});
      }
    }
  }
  else
  {
    res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors: [{msg: "You must sign in to rate an item"}]});
  }
});

module.exports = router;
