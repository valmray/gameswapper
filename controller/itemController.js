var express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var expressSanitizer = require('express-sanitizer');

var app = express();
var itemDB = require('../models/itemDB');
var feedbackDB = require('../models/feedbackDB');

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
var ItemFeedbackModel = feedbackDB.itemFeedback;


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

   allItemFeedback = JSON.parse(JSON.stringify(await feedbackDB.getAllItemFeedback()));



  next();
});

var itemCodeValid = false;
var theItemValid = false;
var itemC = {};
var itemCT = {};
var ratingValid = false;

router.get('/item', [ check('theItem').custom((value, { req }) => {
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
check('rating').custom((value, { req }) => {
  if(check('rating').isNumeric())
  {
    if(req.query.rating > 0 && req.query.rating < 5)
    {
      ratingValid = true;
    }
    else
    {
      ratingValid = false;
    }
  }
  else
  {
    ratingValid = false;
  }

})], async function(req, res)
{
  var qs = req.query;
  var items = await itemDB.getAllItems();
  var itemValid = false;
  var sessData = req.session;
  var itemOwned = false;

  const errors = validationResult(req);

  var msg = JSON.parse(JSON.stringify(errors.array()));
  console.log(msg);
  //console.log(get);

  if(qs.itemCode != null  || qs.theItem != null)
  {

      if(itemCodeValid || theItemValid)
      {
        itemValid = true;
      }



      if(itemValid == true)
      {
        var item = {};

        if(qs.itemCode != null)
        {
          item = itemC;
          sessData.item = item;

          console.log("Valid Rating: " + ratingValid);

          if(ratingValid && sessData.theUser)
          {
            var userData = JSON.parse(JSON.stringify(sessData.theUser));

            console.log("User ID Rating: " + userData.userId);

            var update = false;

            console.log("All item feedback length: " + allItemFeedback.length);

            for(var i = 0; i < allItemFeedback.length; i++)
            {
              if(allItemFeedback[i].userID == userData.userId && allItemFeedback[i].itemCode == qs.itemCode)
              {
                update = true;
              }
            }

            if(update)
            {
              feedbackDB.updateItemFeedback(qs.itemCode, userData.userId, qs.rating);
            }
            else
            {
              feedbackDB.addItemFeedback(qs.itemCode, userData.userId, qs.rating);
            }

          }

        }
        else if(qs.theItem != null)
        {
          item = itemCT;
          sessData.item = item;
        }

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


        console.log("Current Item: " +   item.code);

        var data;

        data = Item.item(item.code, item.name, item.category, item.description, item.rating, item.imageUrl);
        console.log(data.get.getName());

        var sessData = req.session;


        if(sessData.theUser)
        {
          var user = sessData.theUser;
          var profile;
          if(sessData.currentProfile)
          {
            profile = Profile.profile(sessData.currentProfile.userID, sessData.currentProfile.userItems);

            var userSwapIn = [];
            var userSwapInfo = [];

            userSwapIn = sessData.userSwapInfo;
            console.log("User Swap Item Code: " + userSwapIn[0].userItem.code);

            for(var i = 0; i < userSwapIn.length; i++)
            {
              var userItem = userSwapIn[i].userItem;
              var rating = userSwapIn[i].rating;
              var status = userSwapIn[i].status;
              var swapItem = userSwapIn[i].swapItem;
              var swapItemRating = userSwapIn[i].swapItemRating;
              var swapperRating = userSwapIn[i].swapperRating;

              userSwapInfo.push(UserSwap.userSwap(userItem, rating, status, swapItem, swapItemRating, swapperRating));
            }

            console.log("User ID: " + profile.get.getUserItems());
            var userItems = [];
            userItems = profile.get.getUserItems();
            catUserItems = [];
            var swapItem;
            var savePosition = 0;
            for(var i = 0; i < userItems.length; i++)
            {
              if(userSwapInfo[i].get.getUserItem().code === qs.itemCode)
              {
                data = userSwapInfo[i].get.getUserItem();
                savePosition = i;
              }
            }

            var status = userSwapInfo[savePosition].get.getStatus();

            console.log("Current Data: " + data);

            res.render(path.resolve(__dirname, '../views') + '/item', {item: item, user: user, status: status, action: "", itemOwned: itemOwned});
          }
          else
          {
            res.render(path.resolve(__dirname, '../views') + '/item', {item: item, user: "", status: "", action: "", itemOwned: itemOwned});
          }
        }
        else
        {
          res.render(path.resolve(__dirname, '../views') + '/item', {item: item, user: "", status: "", action: "", itemOwned: itemOwned});
        }
      }
      else
      {
        var sessData = req.session;


        if(sessData.theUser)
        {
          var user = sessData.theUser;
          var profile = sessData.currentProfile;
          var newItem = [];
          var userItems = [];
          userItems = profile.userItems;

          for(var i = 0; i < allItems.length; i++)
          {
            var b = false;
            for(var j = 0; j < userItems.length; j++)
            {
              if(allItems[i].code == userItems[j].code)
              {
                b = true;
              }
            }

            if(b == false)
            {
              newItem.push(allItems[i]);
            }

          }
          res.render(path.resolve(__dirname, '../views') + '/categories', {item: {}, user: user, category: "", searchR: newItem, errors: msg});

        }
        else
        {
          res.render(path.resolve(__dirname, '../views') + '/categories', {item: {}, user: "", category: "", searchR: items, errors: msg});

          //res.render(path.resolve(__dirname, '../views') + '/item', {item: {}, user: ""});
        }
      }

  }
  else
  {
    //res.render(path.resolve(__dirname, '../views') + '/categories', {category: "", searchR: []});
    var sessData = req.session;


    if(sessData.theUser)
    {
      var user = sessData.theUser;
      var user = sessData.theUser;
      var profile = sessData.currentProfile;
      var newItem = [];
      var userItems = [];
      userItems = profile.userItems;

      for(var i = 0; i < allItems.length; i++)
      {
        var b = false;
        for(var j = 0; j < userItems.length; j++)
        {
          if(allItems[i].code == userItems[j].code)
          {
            b = true;
          }
        }

        if(b == false)
        {
          newItem.push(allItems[i]);
        }

      }
      res.render(path.resolve(__dirname, '../views') + '/categories', {item: {}, user: user, category: "", searchR: newItem, errors: msg});

      //res.render(path.resolve(__dirname, '../views') + '/item', {item: {}, user: user});
    }
    else
    {
      res.render(path.resolve(__dirname, '../views') + '/categories', {item: {}, user: "", category: "", searchR: items, errors: msg});

      //res.render(path.resolve(__dirname, '../views') + '/item', {item: {}, user: ""});
    }
  }
});

var itemCT = {};
router.post('/item', [ check('theItem').custom((value, { req }) => {
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
      return Promise.reject('Item is incorrect');
    }
  });
}),
check('action').isAlpha().withMessage("Action is invalid or undefined")
.isLength({max: 15}).withMessage("Action cannot be longer than 15 characters")  ], async function(req, res, next)
{
  var qs = req.query;
  var items = await itemDB.getAllItems();
  var itemValid = false;
  var sessData = req.session;

  const errors = validationResult(req);

  var msg = JSON.parse(JSON.stringify(errors.array()));
  console.log(msg);
  if(qs.action != null && qs.theItem != null)
  {
    //var getItem = await itemDB.getItem(qs.theItem);
    //var item = JSON.parse(JSON.stringify(getItem));
    var status1 = false;
    var status = false;
    var newStatus = "available";
    var pendingOffers = [];
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


    var offers = JSON.parse(JSON.stringify(allOffers));
    console.log(offers[0].itemStatus);
    for(var i = 0; i < offers.length; i++)
    {
      if(offers[i].itemStatus === "pending")
      {
        pendingOffers.push(offers[i]);
      }
    }
    console.log(pendingOffers[0].itemStatus);



    if(sessData.theUser)
    {
      var user = sessData.theUser;

      for(var j = 0; j < pendingOffers.length; j++)
      {
        if(qs.theItem == pendingOffers[j].itemCodeWant || qs.theItem == pendingOffers[j].itemCodeOwn)
        {
          status = true;
          newStatus = "pending";
        }
      }
    if(qs.action === "update")
    {

      var userItems = [];
      userItems = sessData.currentProfile.userItems;

      var userOffers = [];


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
              offerID: offers[i]._id,
              userID: offers[i].userID,
              itemCodeOwn: itemWant,
              itemCodeWant: itemOwn,
              itemStatus: offers[i].itemStatus,
              own: 1
            });
          }
          else if(offers[i].itemCodeWant == userItems[j].code)
          {
            userOffers.push({
              offerID: offers[i]._id,
              userID: offers[i].userID,
              itemCodeOwn: itemWant,
              itemCodeWant: itemOwn,
              itemStatus: offers[i].itemStatus,
              own: 0
            });
          }
        }
      }
      if(status1 == true)
      {
        res.render(path.resolve(__dirname, '../views') + '/mySwaps', {userOffers: userOffers, user: sessData.theUser, code: qs.theItem});
      }
      else {
        res.render(path.resolve(__dirname, '../views') + '/item', {item: itemCT, user: sessData.theUser, status: newStatus, action: qs.action, itemOwned: itemOwned});

      }
    }
  }
  else
  {
    if(status == true)
    {
      res.render(path.resolve(__dirname, '../views') + '/mySwaps', {userOffers: [], user: {}, code: qs.theItem});
    }
    else
    {
      res.render(path.resolve(__dirname, '../views') + '/item', {item: itemCT, user: {}, status: newStatus, action: "", itemOwned: itemOwned});
    }
  }
  }
  else
  {
    //res.render(path.resolve(__dirname, '../views') + '/categories', {category: "", searchR: []});
    var sessData = req.session;


    if(sessData.theUser)
    {
      var user = sessData.theUser;
      res.render(path.resolve(__dirname, '../views') + '/myItems', {user: sessData.theUser, profile: sessData.currentProfile});

      //res.render(path.resolve(__dirname, '../views') + '/item', {item: {}, user: user});
    }
    else
    {
      res.render(path.resolve(__dirname, '../views') + '/myItems', {user: sessData.theUser, profile: sessData.currentProfile});

      //res.render(path.resolve(__dirname, '../views') + '/item', {item: {}, user: ""});
    }
  }
  next();
});

module.exports = router;
