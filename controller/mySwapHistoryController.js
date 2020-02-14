var express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var expressSanitizer = require('express-sanitizer');

var app = express();
var itemDB = require('../models/itemDB');
var userDB = require('../models/userDB');
var offerDB = require('../models/offerDB');
var swapDB = require('../models/swapDB');
var storedIDsDB = require('../models/storedIDsDB');
var feedbackDB = require('../models/feedbackDB');


var Item = require('../models/item');
var User = require('../models/user');
var Profile = require('../models/userProfile');
var UserSwap = require('../models/userSwap');
var ItemModel = itemDB.item;
var ItemFeedbackModel = feedbackDB.itemFeedback;


var session = require('express-session');

app.set('view engine', 'ejs');
app.use('/resources', express.static('../resources'));
app.use('/views', express.static('../views'));
app.use(session({secret: "secret-key"}));
app.use(cookieParser());

var router = express.Router();

var allItems = [];
var allOffers = [];
var allSwaps = [];
var allOfferFeedback = [];

var mongoose = require('mongoose');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var expressValidator = require('express-validator');

router.use(bodyParser.text());
router.use(urlencodedParser);
app.use(expressValidator);

app.use(expressSanitizer());
router.use(expressSanitizer());
var allIds = {};


const { check, validationResult } = require('express-validator/check');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var allItemFeedback = [];

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

    console.log("Sanitized Name: " + allItemsSanitize[i].name);

  }

  allItems = JSON.parse(JSON.stringify(allItemsSanitize));


  var allOffersSanitize = [];
  allOffersSanitize = JSON.parse(JSON.stringify(await offerDB.getAllOffers()));


  for (var i = 0; i < allOffersSanitize.length; i++) {
    allOffersSanitize[i].userID = req.sanitize(allOffersSanitize[i].userID);
    allOffersSanitize[i].itemCodeOwn = req.sanitize(allOffersSanitize[i].itemCodeOwn);
    allOffersSanitize[i].itemCodeWant = req.sanitize(allOffersSanitize[i].itemCodeWant);
    allOffersSanitize[i].itemStatus = req.sanitize(allOffersSanitize[i].itemStatus);
  }

  allOffers = JSON.parse(JSON.stringify(allOffersSanitize));



  var allSwapsSanitize = JSON.parse(JSON.stringify(await swapDB.getAllSwaps()));

  for (var i = 0; i < allSwapsSanitize.length; i++) {

    allSwapsSanitize[i].userItem.name = req.sanitize(allSwapsSanitize[i].userItem.name);
    allSwapsSanitize[i].userItem.code = req.sanitize(allSwapsSanitize[i].userItem.code);
    allSwapsSanitize[i].userItem.category = req.sanitize(allSwapsSanitize[i].userItem.category);
    allSwapsSanitize[i].userItem.description = req.sanitize(allSwapsSanitize[i].userItem.description);
    allSwapsSanitize[i].userItem.rating = req.sanitize(allSwapsSanitize[i].userItem.rating);
    allSwapsSanitize[i].userItem.imageUrl = req.sanitize(allSwapsSanitize[i].userItem.imageUrl);

    allSwapsSanitize[i].rating = req.sanitize(allSwapsSanitize[i].rating);
    allSwapsSanitize[i].status = req.sanitize(allSwapsSanitize[i].status);


    allSwapsSanitize[i].swapItem.name = req.sanitize(allSwapsSanitize[i].swapItem.name);
    allSwapsSanitize[i].swapItem.code = req.sanitize(allSwapsSanitize[i].swapItem.code);
    allSwapsSanitize[i].swapItem.category = req.sanitize(allSwapsSanitize[i].swapItem.category);
    allSwapsSanitize[i].swapItem.description = req.sanitize(allSwapsSanitize[i].swapItem.description);
    allSwapsSanitize[i].swapItem.rating = req.sanitize(allSwapsSanitize[i].swapItem.rating);
    allSwapsSanitize[i].swapItem.imageUrl = req.sanitize(allSwapsSanitize[i].swapItem.imageUrl);


    allSwapsSanitize[i].swapItemRating = req.sanitize(allSwapsSanitize[i].swapItemRating);
    allSwapsSanitize[i].swapperRating = req.sanitize(allSwapsSanitize[i].swapperRating);
  }

  allSwaps = JSON.parse(JSON.stringify(allSwapsSanitize));


  var allIdsSanitize = [];
  allIdsSanitize = JSON.parse(JSON.stringify(await storedIDsDB.getStoredIDs()));

  console.log("Stored User ID: " + allIdsSanitize[0].userId);


  for (var i = 0; i < allIdsSanitize.length; i++) {
    allIdsSanitize[i].userId = req.sanitize(allIdsSanitize[i].userId);
    allIdsSanitize[i].offerID = req.sanitize(allIdsSanitize[i].offerID);
  }

  allIds = allIdsSanitize[0];
  allItemFeedback = JSON.parse(JSON.stringify(await feedbackDB.getAllItemFeedback()));
  allOfferFeedback = JSON.parse(JSON.stringify(await feedbackDB.getAllOfferFeedback()));



  next();
});

var itemCodeValid = false;
var theItemValid = false;
var itemC = {};
var itemCT = {};

router.get('/mySwapHistory', function (req, res, next) {
  var qs = req.body;
  var sessData = req.session;
  const errors = validationResult(req)
  var msg = JSON.parse(JSON.stringify(errors.array()));
  console.log(msg);

  if(sessData.theUser)
  {

    var initiated = [];
    var involved = [];

    for(var i = 0; i < allSwaps.length; i++)
    {
      for(var j = 0; j < allOffers.length; j++)
      {
        if(allSwaps[i].offerID == allOffers[j].offerID)
        {

          if(sessData.theUser.userId == allOffers[j].userID)
          {
            initiated.push(allSwaps[i]);
          }
          else if(sessData.theUser.userId == allOffers[j].swapperID)
          {
            involved.push(allSwaps[i]);
          }

        }
      }
    }

    res.render(path.resolve(__dirname, '../views') + '/mySwapHistory', {user: sessData.theUser, initiated: initiated, involved: involved});
  }
  else
  {
    res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors: [{msg: "You must sign in to rate an item"}]});
  }

});

//check user item rating, swapper rating, and swap item rating
router.post('/mySwapHistory', [], async function(req, res)
{
  var qs = req.body;


  var sessData = req.session;

  const errors = validationResult(req);

  var msg = JSON.parse(JSON.stringify(errors.array()));
  console.log(msg);
  if(sessData.theUser)
  {

    var initiated = [];
    var involved = [];

    for(var i = 0; i < allSwaps.length; i++)
    {
      for(var j = 0; j < allOffers.length; j++)
      {
        if(allSwaps[i].offerID == allOffers[j].offerID)
        {

          if(sessData.theUser.userId == allOffers[j].userID)
          {
            initiated.push(allSwaps[i]);
          }
          else if(sessData.theUser.userId == allOffers[j].swapperID)
          {
            involved.push(allSwaps[i]);
          }

        }
      }
    }
    var swapped = false;

    for(var i = 0; i < allSwaps.length; i++)
    {
      if(allSwaps[i].offerID == sessData.swapOffer.offerID)
      {
        swapped = true;
      }
    }

    if(qs.swapperRating != null && qs.itemRating != null && swapped == false)
    {
      var offerU = sessData.swapOffer;

      var userData = sessData.theUser;

      offerDB.updateOffer(offerU.offerID, "swapped", offerU);

      var offerStatus = JSON.parse(JSON.stringify(await offerDB.getOffer(offerU.offerID)));

      var swap = {}

      if(offerU.own == 0)
      {
        swap = {
          offerID: offerU.offerID,
          userItem: offerU.itemCodeWant,
          rating: qs.itemRating,
          status: offerStatus.itemStatus,
          swapItem: offerU.itemCodeOwn,
          swapItemRating: qs.swapItemRating,
          swapperRating: qs.swapperRating
        };
      }
      else
      {
        swap = {
          offerID: offerU.offerID,
          userItem: offerU.itemCodeOwn,
          rating: qs.itemRating,
          status: offerStatus.itemStatus,
          swapItem: offerU.itemCodeWant,
          swapItemRating: qs.swapItemRating,
          swapperRating: qs.swapperRating
        };
      }

      if(offerU.own == 1)
      {
        var itemFeedbackOwn = JSON.parse(JSON.stringify(await feedbackDB.getItemFeedback(offerU.itemCodeOwn.code, offerU.swapperID)));

        swapDB.addSwap(offerU.offerID, offerU, offerStatus.itemStatus, qs.itemRating, itemFeedbackOwn.rating, qs.swapperRating, offerU.own);
      }
      else
      {

        var itemFeedbackWant = JSON.parse(JSON.stringify(await feedbackDB.getAllItemFeedback()));
        var allOfferFeedback2 = [];
        var userFeedback = {};
        var itemSwapFeedback = {};
        allOfferFeedback2 = JSON.parse(JSON.stringify(await feedbackDB.getAllOfferFeedback()));

        for(var i = 0; i < allOfferFeedback2.length; i++)
        {
          if(allOfferFeedback2[i].swapperID == sessData.theUser.userId && allOfferFeedback2[i].userID == offerU.userID)
          {
            userFeedback = allOfferFeedback2[i];
          }
        }
        var itemSwapFeedback2 = {};
        for(var i = 0; i < itemFeedbackWant.length; i++)
        {
          if(itemFeedbackWant[i].userID == offerU.userID && itemFeedbackWant[i].itemCode == offerU.itemCodeWant.code)
          {
            itemSwapFeedback = itemFeedbackWant[i];
          }

          if(itemFeedbackWant[i].userID == offerU.userID && itemFeedbackWant[i].itemCode == offerU.itemCodeOwn.code)
          {    
            itemSwapFeedback2 = itemFeedbackWant[i];
          }
        }

        //var swapper = {}
        //swapper = JSON.parse(JSON.stringify(await userDB.getUser()));
        //userDB.swapUserItems(swapper, sessData.theUser ,offerU.itemCodeOwn.code, offerU.itemCodeWant.code)

        swapDB.addSwap(offerU.offerID, offerU, "swapped", itemSwapFeedback2.rating, itemSwapFeedback.rating, userFeedback.rating, offerU.own);
      }


      var update = false;


      console.log("All item feedback length: " + allItemFeedback.length);
      var offerFeedback = false;
      var storedFeedback = {};

      for(var i = 0; i < allOfferFeedback.length; i++)
      {
        console.log("User ID: " + allOfferFeedback[i].userID + " Swapper ID: " + allOfferFeedback[i].swapperID + " QS: " + offerU.userID);

        if(allOfferFeedback[i].userID == sessData.theUser.userId && allOfferFeedback[i].swapperID == offerU.userID)
        {
          storedFeedback = allOfferFeedback[i];
          offerFeedback = true;
        }
      }

      if(offerFeedback)
      {
        feedbackDB.updateOfferFeedback(storedFeedback.offerID, storedFeedback.userID, storedFeedback.swapperID, qs.swapperRating);
      }
      else
      {
        feedbackDB.addOfferFeedback(offerU.offerID, sessData.theUser.userId, offerU.userID, qs.swapperRating);
      }

      for(var i = 0; i < allItemFeedback.length; i++)
      {
        console.log("User ID: " + allItemFeedback[i].userID + " Item Code: " + allItemFeedback[i].itemCode);
        if(allItemFeedback[i].userID == sessData.theUser.userId && allItemFeedback[i].itemCode == offerU.itemCodeWant.code)
        {
          console.log("Hello");
          update = true;
        }
      }

      if(update)
      {
        feedbackDB.updateItemFeedback(offerStatus.itemCodeOwn, sessData.theUser.userId, qs.itemRating);
      }
      else
      {
        feedbackDB.addItemFeedback(offerStatus.itemCodeOwn, sessData.theUser.userId, qs.itemRating);
      }

      res.render(path.resolve(__dirname, '../views') + '/mySwapHistory', {user: sessData.theUser, initiated: initiated, involved: involved});

    }
    else
    {
      res.render(path.resolve(__dirname, '../views') + '/mySwapHistory', {user: sessData.theUser, initiated: initiated, involved: involved});
    }
  }
  else
  {
    res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors: [{msg: "You must sign in to rate an item"}]});
  }
});

module.exports = router;
