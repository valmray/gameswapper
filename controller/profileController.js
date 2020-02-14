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

var allItems = [];
var allSwaps = [];


//var allUsers = [];


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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

router.use(bodyParser.text());
router.use(urlencodedParser);

var expressValidator = require('express-validator');

app.use(expressSanitizer());
router.use(expressSanitizer());


app.use(expressValidator);

const { check, validationResult } = require('express-validator/check');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var mongoSanitize = require('express-mongo-sanitize');


var allOffers = [];
var allOffersSanitize = [];

app.use(mongoSanitize());
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

   var string = "<script>hello</script> world"
   string = req.sanitize(string);

   console.log("Sanitized Name: " + allItems[0].name);
   console.log("Sanitized String: " + string);

   allOffersSanitize = JSON.parse(JSON.stringify(await offerDB.getAllOffers()));


   for (var i = 0; i < allOffersSanitize.length; i++) {
     allOffersSanitize[i].userID = req.sanitize(allOffersSanitize[i].userID);
     allOffersSanitize[i].itemCodeOwn = req.sanitize(allOffersSanitize[i].itemCodeOwn);
     allOffersSanitize[i].itemCodeWant = req.sanitize(allOffersSanitize[i].itemCodeWant);
     allOffersSanitize[i].itemStatus = req.sanitize(allOffersSanitize[i].itemStatus);
   }

   allOffers = JSON.parse(JSON.stringify(allOffersSanitize));

  //allUsers = await userDB.getAllUsers();
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

  next();
});
var theItemValid = false;
var currUser = {};
var itemCT = {};
router.get('/myItems', [ body('username').custom((value, { req }) => {
  return UserModel.find({email: req.body.username, password: req.body.password}).then(user => {

    if(user.length > 0)
    {
      currUser = user[0];

      currUser = user[0];

      currUser.fname = req.sanitize(currUser.fname);
      currUser.lname = req.sanitize(currUser.lname);
      currUser.userId = req.sanitize(currUser.userId);
      currUser.address1 = req.sanitize(currUser.address1);
      currUser.address2 = req.sanitize(currUser.address2);
      currUser.city = req.sanitize(currUser.city);
      currUser.stateReg = req.sanitize(currUser.stateReg);
      currUser.postCode = req.sanitize(currUser.postCode);
      currUser.country = req.sanitize(currUser.country);

      for(var i = 0; i < currUser.items.length; i++)
      {
        currUser.items[i] = req.sanitize(currUser.items[i]);
      }

      console.log("User is valid");
    }
    else
    {
      console.log("User is invalid")
      return Promise.reject('Email or password is incorrect');
    }
  });
}),
body('username').isEmail().normalizeEmail(),
body('password').not().isEmpty().trim().escape(),
check('theItem').custom((value, { req }) => {
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
check('action').isAlpha().withMessage("Action is invalid or undefined")
.isLength({max: 15}).withMessage("Action cannot be longer than 15 characters")], async function(req, res)
{
  var qs = req.query;
  var sessData = req.session;
  const errors = validationResult(req);

  var msg = JSON.parse(JSON.stringify(errors.array()));
  if(sessData.currentProfile && sessData.theUser)
  {
    var user = sessData.theUser;
    if(qs.action === "delete")
   {
     //var profile = Profile.profile(0, []);
     var sessData = req.session;
     var profile = sessData.currentProfile;
     var qs = req.query;
     var newItemsArray = [];


     //console.log(allItems2);

     if(theItemValid)
     {
     profile = Profile.profile(sessData.currentProfile.userID, sessData.currentProfile.userItems);

     for(var i = 0; i < allItems.length; i++)
     {
         if(qs.theItem == allItems[i].code)
         {
           newItemsArray = profile.other.removeUserItem(sessData.theUser, allItems[i]);
         }
     }

     console.log("New Array: " + newItemsArray);
     sessData.currentProfile =  Profile.profile(profile.userID, newItemsArray);

     res.render(path.resolve(__dirname, '../views') + '/myItems', {user: sessData.theUser, profile: sessData.currentProfile, userSwaps: sessData.userSwaps, errors: []});

     }
     else {
       res.render(path.resolve(__dirname, '../views') + '/myItems', {user: sessData.theUser, profile: sessData.currentProfile, userSwaps: sessData.userSwaps, errors: [{msg:"Invalid Item Code"}]});
      }
   }
   else
   {
     res.render(path.resolve(__dirname, '../views') + '/myItems', {user: sessData.theUser, profile: sessData.currentProfile, userSwaps: sessData.userSwaps, errors: []});

   }
  }
  else
  {
    var profile = Profile.profile(0, []);
    console.log(msg);

    res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors: msg});
  }
});



var userValid = false;

router.post("/myItems", [ body('username').custom((value, { req }) => {
  return UserModel.find({email: req.body.username, password: req.body.password}).then(user => {

    if(user.length > 0)
    {
      userValid = true;

      currUser = user[0];

      currUser.fname = req.sanitize(currUser.fname);
      currUser.lname = req.sanitize(currUser.lname);
      currUser.userId = req.sanitize(currUser.userId);
      currUser.address1 = req.sanitize(currUser.address1);
      currUser.address2 = req.sanitize(currUser.address2);
      currUser.city = req.sanitize(currUser.city);
      currUser.stateReg = req.sanitize(currUser.stateReg);
      currUser.postCode = req.sanitize(currUser.postCode);
      currUser.country = req.sanitize(currUser.country);

      for(var i = 0; i < currUser.items.length; i++)
      {
        currUser.items[i] = req.sanitize(currUser.items[i]);
      }

      //sanitizeBody(user)

      console.log("User is valid");
    }
    else
    {
      userValid = false;

      console.log("User is invalid")
      return Promise.reject('Email or password is incorrect');
    }
  });
}),
body('username').isEmail().normalizeEmail(),
body('password').not().isEmpty().trim().escape(),
check('theItem').custom((value, { req }) => {
  return ItemModel.find({code: req.query.theItem}).then(item => {

    if(item.length > 0)
    {
      theItemValid = true;

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
check('action').isAlpha().withMessage("Action is invalid or undefined")
.isLength({max: 15}).withMessage("Action cannot be longer than 15 characters")], async function (req, res, next) {
  //console.log('Request Type:', req.type);
  //var users = userDB.getAllUsers();
  var qs = req.body;

  const errors = validationResult(req);

  var msg = JSON.parse(JSON.stringify(errors.array()));
  console.log(msg);
  //var body = JSON.parse(JSON.stringify(qs.array()));
  //console.log("Body: " + body);

  if(qs.action === "signIn")
  {
      var user;
      var sessData = req.session;
      var profile;

       if(userValid)
       {
         var getUser = JSON.parse(JSON.stringify(currUser));
         sessData.theUser = getUser;
         var userSwaps = [];
         var aSwaps = [];
         aSwaps = JSON.parse(JSON.stringify(allSwaps));

         for(var i = 0; i < aSwaps.length; i++)
         {
           for(var j = 0; j < aSwaps.length; j++)
           {
             if(getUser.items[j] == aSwaps[i].userItem.code)
             {
               userSwaps.push(aSwaps[i]);
             }
           }
         }

         //sessData.userSwaps = userSwaps;

         var userOffers = []
         for(var i = 0; i < allOffers.length; i++)
         {
           if(allOffers[i].userID == sessData.theUser.userId || allOffers[i].swapperID == sessData.theUser.userId)
           {
             userOffers.push(allOffers[i]);
           }
         }
         sessData.userSwaps = userOffers;
         console.log("Item Status: " + sessData.userSwaps[0].itemStatus)


         //console.log(sessData.theUser);
         user = sessData.theUser;
         console.log("ID: " +sessData.theUser.userId);

         var userItems = user.items;
        // console.log("User Items: " + userItems);


         var position = 0;
         var currentUserItems = [];


         for(var i = 0; i < userItems.length; i++)
         {
           for(var j = 0; j < allItems.length; j++)
           {
             if(userItems[i] == allItems[j].code)
             {
               var item = allItems[j];
               //console.log("J: " + items[j]);
               currentUserItems.push(item);
               position++;
             }
           }
         }

         var profile = {};

         profile = JSON.parse(JSON.stringify(await userDB.getUserProfile(user.userId)));

         for(var i = 0; i < profile.userItems.length; i++)
         {
           profile.userItems[i].name = req.sanitize(profile.userItems[i].name);
           profile.userItems[i].code = req.sanitize(profile.userItems[i].code);
           profile.userItems[i].category = req.sanitize(profile.userItems[i].category);
           profile.userItems[i].description = req.sanitize(profile.userItems[i].description);
           profile.userItems[i].rating = req.sanitize(profile.userItems[i].rating);
           profile.userItems[i].imageUrl = req.sanitize(profile.userItems[i].imageUrl);

           console.log("Profile Item Name: " + profile.userItems[i].name);
         }



         sessData.currentProfile = profile;

         console.log("New Profile: " + profile.userID);
         console.log("New User: " + sessData.theUser);


        // profile = sessData.currentProfile;

         var userSwapInfo = [];

         for(var i = 0; i < currentUserItems.length; i++)
         {
           var itemInfo = UserSwap.userSwap(currentUserItems[i], currentUserItems[i].rating, "pending", {}, "3", "3");
           userSwapInfo.push(itemInfo);
         }
         sessData.userSwapInfo = userSwapInfo;

         //req.sanitize('fname').escape();

         res.render(path.resolve(__dirname, '../views') + '/myItems', {user: user, profile: sessData.currentProfile, userSwaps: sessData.userSwaps, errors: []});

        }
        else
        {

          var msg = JSON.parse(JSON.stringify(errors.array()));
          console.log(msg);
          res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors: msg});
        }
  }
  else if(qs.action === "delete")
  {
    //var profile = Profile.profile(0, []);
    var sessData = req.session;
    var profile = sessData.currentProfile;
    var qs = req.query;
    var newItemsArray = [];
    var allItems2 = [];
    allItems2 = await itemDB.getAllItems();

    //console.log(allItems2);

    if(theItemValid)
    {
    profile = Profile.profile(sessData.currentProfile.userID, sessData.currentProfile.userItems);

    for(var i = 0; i < allItems.length; i++)
    {
        if(qs.theItem == allItems[i].code)
        {
          newItemsArray = profile.other.removeUserItem(sessData.theUser, allItems[i]);
        }
    }

    console.log("New Array: " + newItemsArray);
    sessData.currentProfile =  Profile.profile(profile.userID, newItemsArray);
    res.render(path.resolve(__dirname, '../views') + '/myItems', {user: sessData.theUser, profile: sessData.currentProfile, userSwaps: sessData.userSwaps, errors: []});

    }
    else {
      res.render(path.resolve(__dirname, '../views') + '/myItems', {user: sessData.theUser, profile: sessData.currentProfile, userSwaps: sessData.userSwaps, errors: [{msg:"Invalid Item Code"}]});

    }
  }
  else {
    var profile = Profile.profile(0, []);
    res.render(path.resolve(__dirname, '../views') + '/myItems', {user: "", profile: profile, userSwaps: [], errors: []});
  }


});


module.exports = router;
