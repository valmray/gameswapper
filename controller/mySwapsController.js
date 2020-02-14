var express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var expressSanitizer = require('express-sanitizer');

var app = express();
var itemDB = require('../models/itemDB');
var userDB = require('../models/userDB');
var offerDB = require('../models/offerDB');
var feedbackDB = require('../models/feedbackDB');

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
var allOfferFeedback = [];
var allItemFeedback = [];


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

  allOfferFeedback = JSON.parse(JSON.stringify(await feedbackDB.getAllOfferFeedback()));
  allItemFeedback = JSON.parse(JSON.stringify(await feedbackDB.getAllItemFeedback()));


  next();
});

var itemCodeValid = false;
var theItemValid = false;
var itemC = {};
var itemCT = {};

router.get('/mySwaps', [ check('offerCode').custom((value, { req }) => {
  return ItemModel.find({code: req.query.offerCode}).then(item => {

    if(item.length > 0)
    {
      theItemValid = true;

      itemCT = item[0];

      itemCT.name = req.sanitize(itemCT.name);
      itemCT.code = req.sanitize(itemCT.code);
      itemCT.category = req.sanitize(itemCT.category);
      itemCT.description = req.sanitize(itemCT.description);
      itemCT.rating = req.sanitize(itemCT.rating);
      itemCT.imageUrl = req.sanitize(itemCT.imageUrl);

      console.log("Item is valid");
    }
    else
    {
      theItemValid = false;

      console.log("Item is invalid")
      return Promise.reject('Item is invalid');
    }
  });
}),
check('itemCode').custom((value, { req }) => {
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
}),
check('position').isNumeric().withMessage("Position is invalid or undefined"),
check('action').isAlpha().withMessage("Action is invalid or undefined")
.isLength({max: 15}).withMessage("Action cannot be longer than 15 characters") ],async function(req, res)
{
  var qs = req.query;
  var itemValid = false;
  var offerValid = false;
  var sessData = req.session;
  const errors = validationResult(req);

  var msg = JSON.parse(JSON.stringify(errors.array()));
  console.log(msg);
  if(qs.itemCode != null && qs.offerCode != null)
  {

    var items = JSON.parse(JSON.stringify(allItems));

      if(sessData.theUser)
      {
      if(itemCodeValid && theItemValid)
      {

          var getItem = itemC;
          var getOffer = itemCT;
          var item = JSON.parse(JSON.stringify(getItem));
          var offer = JSON.parse(JSON.stringify(getOffer));

          var currOffer = false;
          var storedOffer = {};

          var userItems = [];
          userItems = sessData.currentProfile.userItems;

          var userOffers = [];
          var userNum = 0;

          for(var i = 0; i < allOffers.length; i++)
          {
            if(allOffers[i].userID == sessData.theUser.userId && allOffers[i].swapperID &&
                allOffers[i].itemCodeOwn == qs.itemCode && allOffers[i].itemCodeWant == qs.offerCode)
                {
                  storedOffer = allOffers[i];
                  currOffer = true;
                }
          }

          var offerFeedback = false;
          var storedFeedback = {};

          for(var i = 0; i < allOfferFeedback.length; i++)
          {
            if(allOfferFeedback[i].userID == sessData.theUser.userId && allOfferFeedback[i].swapperID == qs.swapperID)
            {
              storedFeedback = allOfferFeedback[i];
              offerFeedback = true;
            }
          }

          var update = false;


          console.log("All item feedback length: " + allItemFeedback.length);

          for(var i = 0; i < allItemFeedback.length; i++)
          {
            if(allItemFeedback[i].userID == sessData.theUser.userId && allItemFeedback[i].itemCode == qs.itemCode)
            {
              update = true;
            }
          }

          if(update)
          {
            feedbackDB.updateItemFeedback(qs.itemCode, sessData.theUser.userId, qs.yourItemRating);
          }
          else
          {
            feedbackDB.addItemFeedback(qs.itemCode, sessData.theUser.userId, qs.yourItemRating);
          }


          if(currOffer)
          {
            offerDB.updateOffer(storedOffer.offerID, storedOffer.itemStatus, storedOffer);

            if(offerFeedback)
            {
              feedbackDB.updateOfferFeedback(storedFeedback.offerID, storedFeedback.userID, storedFeedback.swapperID, qs.swapperRating)
            }
            else
            {
              feedbackDB.addOfferFeedback(storedOffer.offerID, sessData.theUser.userId, qs.swapperID, qs.swapperRating)
            }
          }
          else
          {
            offerDB.addOffer(sessData.theUser.userId, qs.swapperID, qs.itemCode, qs.offerCode, "pending", allIds.offerID);

            if(offerFeedback)
            {
              feedbackDB.updateOfferFeedback(storedFeedback.offerID, storedFeedback.userID, storedFeedback.swapperID, qs.swapperRating)
            }
            else
            {
              feedbackDB.addOfferFeedback(allIds.offerID, sessData.theUser.userId, qs.swapperID, qs.swapperRating)
            }
          }


          userNum = allIds.userId;
          var offerNum = ++allIds.offerID;

          storedIDsDB.updateOfferID(userNum, offerNum);
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

            console.log(i);

          }

          console.log(item.name);
          console.log(offer.name);

          var itemData;
          var offerData;

          itemData = Item.item(item.code, item.name, item.category, item.description, item.rating, item.imageUrl);
          offerData = Item.item(offer.code, offer.name, offer.category, offer.description, offer.rating, offer.imageUrl);
          var sessData = req.session;

          res.render(path.resolve(__dirname, '../views') + '/mySwaps', {userOffers: userOffers, user: sessData.theUser, code: qs.theItem});

        }
        else
        {
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
        res.render(path.resolve(__dirname, '../views') + '/mySwaps', {userOffers: userOffers, user: sessData.theUser, code: qs.theItem});

      }

      }
      else
      {

        res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors: [{msg: "You must sign in to view swaps"}]});

      }

  }
  else if(qs.action != null)
  {
    var action = qs.action;
    var itemCode = qs.theItem;
    var status;
    var currentItem;
    for(var i = 0; i < userSwapInfo.length; i++)
    {
      if(itemCode == userSwapInfo[i].get.getUserItem().code)
      {
        //available, pending, or swapped
        userSwapInfo[i].set.setStatus("pending");
        console.log("Status: " + userSwapInfo[i].status);
        status = userSwapInfo[i].status;
        currentItem = userSwapInfo[i].get.getUserItem();
        console.log("Current Item: " + currentItem);

        console.log("Status: " + status);
      }
    }

    sessData.status = status;
    console.log("Status: " + status);

    if(sessData.theUser)
    {
      var user = sessData.theUser;
      if(status === "pending")
      {
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
    if(action === "update")
    {

        res.render(path.resolve(__dirname, '../views') + '/mySwaps', {userOffers: userOffers, user: sessData.theUser, code: qs.theItem});

        }
        else if(status === "available" || status === "swapped")
        {
          console.log("Icode: " + qs.theItem);
          var itemOwned = false;

          if(sessData.theUser)
          {
          for(var i = 0; i < sessData.theUser.items.length; i++)
          {

              if(qs.itemCode == sessData.theUser.items[i] || qs.theItem == sessData.theUser.items[i])
              {
                itemOwned = true;
              }

          }
        }

          res.render(path.resolve(__dirname, '../views') + '/item', {item: currentItem, user: user, profile: sessData.currentProfile, code: qs.theItem, action: "", itemOwned: itemOwned});
        }
      }
      else
      {
        if(status === "pending")
        {
          console.log("Icode: " + qs.theItem);
          res.render(path.resolve(__dirname, '../views') + '/mySwaps', {userOffers: userOffers, user: sessData.theUser, code: qs.theItem});
        }
        else if(status === "available" || status === "swapped")
        {
          console.log("Icode: " + qs.theItem);
          var itemOwned = false;

          if(sessData.theUser)
          {
          for(var i = 0; i < sessData.theUser.items.length; i++)
          {

              if(qs.itemCode == sessData.theUser.items[i] || qs.theItem == sessData.theUser.items[i])
              {
                itemOwned = true;
              }

          }
        }

          res.render(path.resolve(__dirname, '../views') + '/item', {item: currentItem, user: sessData.theUser, profile: sessData.currentProfile, code: qs.theItem, action: "", itemOwned: itemOwned});
        }
      }
    }
  }
  else
  {
    //Need to show users pending offers if signed in
    if(sessData.theUser)
    {

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
      res.render(path.resolve(__dirname, '../views') + '/mySwaps', {userOffers: userOffers, user: sessData.theUser, code: qs.theItem});

    }
    else
    {
      res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors: [{msg: "You must sign in to view swaps"}]});
    }

  }
});

router.post('/mySwaps', [check('theItem').custom((value, { req }) => {
  return ItemModel.find({code: req.query.theItem}).then(item => {

    if(item.length > 0)
    {
      theItemValid = true;
      itemCT = item[0];

      itemCT.name = req.sanitize(itemCT.name);
      itemCT.code = req.sanitize(itemCT.code);
      itemCT.category = req.sanitize(itemCT.category);
      itemCT.description = req.sanitize(itemCT.description);
      itemCT.rating = req.sanitize(itemCT.rating);
      itemCT.imageUrl = req.sanitize(itemCT.imageUrl);

      console.log("Item is valid");
    }
    else
    {
      theItemValid = false;

      console.log("Item is invalid")
      return Promise.reject('Item is incorrect');
    }
  });
}),
check('itemCode').custom((value, { req }) => {
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
}),
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
      if(qs.action === "withdraw" || qs.action === "reject")
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

          var offerU = JSON.parse(JSON.stringify(userOffers[position]));;

          console.log("Update Offer: " + offerU.offerID + offerU.itemStatus);

          offerDB.updateOffer(offerU.offerID, "available", offerU);

          res.render(path.resolve(__dirname, '../views') + '/mySwaps', {userOffers: userOffers, user: sessData.theUser, code: qs.theItem});
        }
        else
        {
          res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors: [{msg: "You must sign in to view swaps"}]});
        }


      }

    }
  }
});

module.exports = router;
