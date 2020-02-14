var express = require('express');
const path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var expressSanitizer = require('express-sanitizer');

var app = express();
var itemDB = require('../models/itemDB');
var userDB = require('../models/userDB');
var ItemModel = itemDB.item;

var Item = require('../models/item');
var UserProfile = require('../models/userProfile');
var UserSwap = require('../models/userSwap');


app.set('view engine', 'ejs');
app.use('/resources', express.static('../resources'));
app.use('/views', express.static('../views'));

var Profile = require('./profileController');
var Category = require('./categoryController');
var MySwaps = require('./mySwapsController');

app.use('/profileController', Profile);
app.use('/categoryController', Category);
app.use('/mySwapsController', MySwaps);

app.use(session({secret: "secret-key"}));
app.use(cookieParser());
var router = express.Router();
var allItems = [];
var allUsers = [];


var mongoose = require('mongoose');

var expressValidator = require('express-validator');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.use(bodyParser.text());
router.use(urlencodedParser);
app.use(expressValidator);

const { check, validationResult } = require('express-validator/check');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

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

     console.log("Sanitized Name: " + allItemsSanitize[i].name);

   }

   allItems = JSON.parse(JSON.stringify(allItemsSanitize));

   allUsers = JSON.parse(JSON.stringify(await userDB.getAllUsers()));

  next();
});

var itemC = {};
var itemCodeValid = false;
var theItemValid = false;

router.get('/swap', [
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
  })
], async function(req, res)
{
  var qs = req.query;
  var itemValid = false;
  var items = [];
  items = JSON.parse(JSON.stringify(allItems));
  const errors = validationResult(req);

  var msg = JSON.parse(JSON.stringify(errors.array()));
  console.log(msg);

  if(qs.itemCode != null)
  {

      if(itemCodeValid)
      {
        var getItem = await itemDB.getItem(qs.itemCode);
        var item = JSON.parse(JSON.stringify(getItem));


        console.log(item.name);

        var data;

        data = Item.item(item.code, item.name, item.category, item.description, item.rating, item.imageUrl);
        var sessData = req.session;


        if(sessData.theUser)
        {
          var getUser = sessData.theUser;
          var user = JSON.parse(JSON.stringify(getUser));
          console.log("Swap User ID: " + sessData.theUser.userId);

          var getProfile = sessData.currentProfile;
          var profile = JSON.parse(JSON.stringify(getProfile));

          console.log("Swap User Items: " + profile.userItems);

          var usersWithItem = [];

          for(var i = 0; i < allUsers.length; i++)
          {
            for(var j = 0; j < allUsers[i].items.length; j++)
            {
              if(allUsers[i].items[j] == qs.itemCode)
              {
                usersWithItem.push(allUsers[i]);
              }
            }
          }

          res.render(path.resolve(__dirname, '../views') + '/swap', {item: itemC, user: user, profile: profile, swappers: usersWithItem});
        }
        else
        {
          res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors: [{msg: "You must sign in to swap items"}]});
        }
      }
      else
      {
        var sessData = req.session;


        if(sessData.theUser)
        {
          var user = sessData.theUser;

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
          res.render(path.resolve(__dirname, '../views') + '/categories', {item: {}, user: user, category: "", searchR: newItem, errors: []});

          //res.render(path.resolve(__dirname, '../views') + '/item', {item: {}, user: user});
        }
        else
        {
          res.render(path.resolve(__dirname, '../views') + '/categories', {item: {}, user: "", category: "", searchR: items, errors: []});

          //res.render(path.resolve(__dirname, '../views') + '/item', {item: {}, user: ""});
        }
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
      res.render(path.resolve(__dirname, '../views') + '/categories', {item: {}, user: user, category: "", searchR: newItem, errors: []});

      //res.render(path.resolve(__dirname, '../views') + '/item', {item: {}, user: user});
    }
    else
    {
      res.render(path.resolve(__dirname, '../views') + '/categories', {item: {}, user: "", category: "", searchR: items, errors: []});

      //res.render(path.resolve(__dirname, '../views') + '/item', {item: {}, user: ""});
    }
  }
});

module.exports = router;
