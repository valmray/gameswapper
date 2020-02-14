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

var Item = require('../models/item');
var User = require('../models/user');
var Profile = require('../models/userProfile');
var UserSwap = require('../models/userSwap');
var ItemModel = itemDB.item;

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


  next();
});

var itemCodeValid = false;
var theItemValid = false;
var itemC = {};
var itemCT = {};



router.post('/swapRatings', [
check('position').isNumeric().withMessage("Position is invalid or undefined"),
check('action').isAlpha().withMessage("Action is invalid or undefined")
.isLength({max: 15}).withMessage("Action cannot be longer than 15 characters")], async function(req, res)
{
  var qs = req.query;
  var itemValid = false;
  var offerValid = false;
  var sessData = req.session;
  var itemCode = qs.theItem;
  var position = qs.position;
  const errors = validationResult(req);

  var msg = JSON.parse(JSON.stringify(errors.array()));
  console.log(msg);
  if(sessData.theUser)
  {
    if(qs.action != null)
    {

      if(qs.action === "accept")
      {
        var itemCode = qs.theItem;
        var currentItem;

        //offerDB.updateOffer()

        if(sessData.theUser)
        {
          var user = sessData.theUser;
          var userItems = [];
          userItems = sessData.currentProfile.userItems;

          var userOffers = [];

          var offers = JSON.parse(JSON.stringify(allOffers));

          for(var i = 0; i < offers.length; i++)
          {
            for(var j = 0; j < userItems.length; j++)
            {
              var getOwnItem = await itemDB.getItem(offers[i].itemCodeOwn);
              var getWantItem = await itemDB.getItem(offers[i].itemCodeWant);
              var itemOwn = JSON.parse(JSON.stringify(getOwnItem));

              itemOwn.name = req.sanitize(itemOwn.name);
              itemOwn.code = req.sanitize(itemOwn.code);
              itemOwn.category = req.sanitize(itemOwn.category);
              itemOwn.description = req.sanitize(itemOwn.description);
              itemOwn.rating = req.sanitize(itemOwn.rating);
              itemOwn.imageUrl = req.sanitize(itemOwn.imageUrl);

              var itemWant = JSON.parse(JSON.stringify(getWantItem));

              itemWant.name = req.sanitize(itemWant.name);
              itemWant.code = req.sanitize(itemWant.code);
              itemWant.category = req.sanitize(itemWant.category);
              itemWant.description = req.sanitize(itemWant.description);
              itemWant.rating = req.sanitize(itemWant.rating);
              itemWant.imageUrl = req.sanitize(itemWant.imageUrl);

              if(offers[i].itemCodeOwn == userItems[j].code)
              {
                userOffers.push({
                  offerID: offers[i].offerID,
                  userID: offers[i].userID,
                  swapperID: offers[i].swapperID,
                  itemCodeOwn: itemWant,
                  itemCodeWant: itemOwn,
                  itemStatus: offers[i].itemStatus,
                  own: 1
                });
              }
              else if(offers[i].itemCodeWant == userItems[j].code)
              {
                userOffers.push({
                  offerID: offers[i].offerID,
                  userID: offers[i].userID,
                  swapperID: offers[i].swapperID,
                  itemCodeOwn: itemWant,
                  itemCodeWant: itemOwn,
                  itemStatus: offers[i].itemStatus,
                  own: 0
                });
              }
            }
          }
          if(position < userOffers.length && position > -1)
          {
            var offerU = JSON.parse(JSON.stringify(userOffers[position]));
            sessData.swapOffer = offerU;

            console.log("Update Offer: " + offerU.offerID + offerU.itemStatus);

            //offerDB.updateOffer(offerU.offerID, "swapped", offerU);
            res.render(path.resolve(__dirname, '../views') + '/swapRatings', {userOffer: offerU, user: sessData.theUser});
          }
          else
          {
            res.render(path.resolve(__dirname, '../views') + '/myItems', {user: sessData.theUser, profile: sessData.currentProfile, userSwaps: sessData.userSwaps, errors: [{msg: "Position is not valid"}]});
          }


        }
        else
        {
          res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors: [{msg: "You must sign in to view the swap ratings page"}]});
        }
      }

    }
  }
});

module.exports = router;
