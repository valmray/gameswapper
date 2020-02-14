var express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var expressSanitizer = require('express-sanitizer');

var app = express();
var itemDB = require('../models/itemDB');
var userDB = require('../models/userDB');
var Item = require('../models/item');
var User = require('../models/user');
var Profile = require('../models/userProfile');
var UserSwap = require('../models/userSwap');
var UserProfile = require('../models/userProfile');

var session = require('express-session');

app.set('view engine', 'ejs');
app.use('/resources', express.static('../resources'));
app.use('/views', express.static('../views'));
app.use(session({secret: "secret-key"}));
app.use(cookieParser());

var router = express.Router();
var allItems = [];

var UserModel = userDB.user;
var ItemModel = itemDB.item;
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var router = express.Router();
var mongoose = require('mongoose');

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


  next();
});
var valid = false;

router.get('/categories',[
  check('catalogCategory').custom(value => {
      if(value != undefined){
        console.log("catalogCategory defined: " + value);

          if(value != "Platformer" && value != "RPG" && value !== "blank" && value !== "Fighter")
          {
            valid = false;

            throw new Error('Invalid catalog category');
          }
          else
          {
            valid = true;
          }
      }
      else{
        console.log("catalogCategory: " + value);
        return value;
      }
  }).withMessage("Catalog category is invalid or undefined")],  async function(req, res)
{

    var qs = req.query;
    var catValid = false;
    var sessData = req.session;
    var newItem = [];
    const errors = validationResult(req);

    var msg = JSON.parse(JSON.stringify(errors.array()));
    console.log(msg);

    if(qs.catalogCategory != null)
    {

      catValid = valid;


      if(catValid == true)
      {
        if(qs.catalogCategory === "blank")
        {
          var sessData = req.session;


          if(sessData.theUser)
          {
            var user = sessData.theUser;
            var profile;
            if(sessData.currentProfile)
            {
              profile = sessData.currentProfile;
              console.log("User ID: " + profile.get.getUserItems());
              var userItems = [];
              userItems = profile.userItems;
              console.log("CodeCode: " + userItems);

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
              res.render(path.resolve(__dirname, '../views') + '/categories', {category: "", searchR: newItem, user: user, errors: []});
            }
            else
            {
              res.render(path.resolve(__dirname, '../views') + '/categories', {category: "", searchR: allItems, user: user, errors: []});
            }
          }
          else
          {
            res.render(path.resolve(__dirname, '../views') + '/categories', {category: "", searchR: allItems, user: "", errors: []});
          }
        }
        else
        {
          var search = [];
          var count = 0;

          console.log(allItems.length);

          for(var i = 0; i < allItems.length; i++)
          {

            if(allItems[i].category === qs.catalogCategory)
            {
              search[count] = allItems[i];
              count++;
            }
          }
          var rating = search[0].rating;



          var sessData = req.session;

          if(sessData.theUser)
          {
            var user = sessData.theUser;
            console.log("User ID: " + user.userId);
            var profile = {};
            if(sessData.currentProfile && sessData.userSwapInfo)
            {
              profile = sessData.currentProfile;
              var userSwapIn = [];
              var userSwapInfo = [];

              //Put function in userDB to get swap info from database
              userSwapIn = sessData.userSwapInfo;

              console.log("Category Profile: " + profile);
              console.log("Category User Items: " + profile.userItems);
              console.log("Category User ID: " + profile.userID);


              for(var i = 0; i < userSwapIn.length; i++)
              {
                var userID = userSwapIn[i].userID;
                var swapperID = userSwapIn[i].swapperID;
                var userItem = userSwapIn[i].userItem;
                var rating = userSwapIn[i].rating;
                var status = userSwapIn[i].status;
                var swapItem = userSwapIn[i].swapItem;
                var swapItemRating = userSwapIn[i].swapItemRating;
                var swapperRating = userSwapIn[i].swapperRating;

                userSwapInfo.push(UserSwap.userSwap(userID, swapperID, userItem, rating, status, swapItem, swapItemRating, swapperRating));
              }

              //console.log("User ID: " + profile.get.getUserItems());
              var userItems = [];

              userItems = profile.userItems;
              catUserItems = [];
              var swapItem;
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

              for(var i = 0; i < newItem.length; i++)
              {
                if(newItem[i].category === qs.catalogCategory)
                {
                  catUserItems.push(newItem[i]);
                }
              }

              for(var i = 0; i < userItems.length; i++)
              {
                if(userSwapInfo[i].get.getUserItem().code == qs.itemCode)
                {
                  swapItem = userSwapInfo[i].get.getUserItem();
                }
              }
              res.render(path.resolve(__dirname, '../views') + '/categories', {category: qs.catalogCategory, searchR: catUserItems, user: user, errors: []});
            }
            else
            {
              console.log("No Session");
              res.render(path.resolve(__dirname, '../views') + '/categories', {category: qs.catalogCategory, searchR: allItems, user: user, errors: []});
            }
          }
          else
          {
            console.log("No Session");
            res.render(path.resolve(__dirname, '../views') + '/categories', {category: qs.catalogCategory, searchR: allItems, user: "", errors: []});
          }


        }
      }
      else
      {
        var sessData = req.session;

        if(sessData.theUser)
        {
          var user = sessData.theUser;
          var profile;
          if(sessData.currentProfile)
          {
            profile = sessData.currentProfile;
            //console.log("User ID: " + profile.get.getUserItems());
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
            res.render(path.resolve(__dirname, '../views') + '/categories', {category: "", searchR: newItem, user: user, errors: msg});
          }
          else
          {
            res.render(path.resolve(__dirname, '../views') + '/categories', {category: "", searchR: allItems, user: user, errors: msg});
          }
        }
        else
        {
          res.render(path.resolve(__dirname, '../views') + '/categories', {category: "", searchR: allItems, user: "", errors: msg});
        }

      }

    }
    else
    {
      var sessData = req.session;

      if(sessData.theUser)
      {
        var user = sessData.theUser;
        var profile;

        if(sessData.currentProfile)
        {
          profile = sessData.currentProfile;
          //console.log("User ID: " + profile.get.getUserItems());
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
          res.render(path.resolve(__dirname, '../views') + '/categories', {category: "", searchR: newItem, user: user, errors: []});
        }
        else
        {
          res.render(path.resolve(__dirname, '../views') + '/categories', {category: "", searchR: allItems, user: user, errors: []});
        }
      }
      else
      {
        res.render(path.resolve(__dirname, '../views') + '/categories', {category: "", searchR: allItems, user: "", errors: []});
      }
    
    }

});

module.exports = router;
