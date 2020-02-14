var express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');

var app = express();
var itemDB = require('../models/itemDB');
var userDB = require('../models/userDB');
var swapDB = require('../models/swapDB');
var storedIDsDB = require('../models/storedIDsDB');
var hashedPasswordDB = require('../models/hashedPasswordDB');


var Item = require('../models/item');
var User = require('../models/user');
var Profile = require('../models/userProfile');
var UserSwap = require('../models/userSwap');
var UserModel = userDB.user;
var ItemModel = itemDB.item;

var allItems = [];
var allSwaps = [];


var allUsers = [];
var allIds = {};

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

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

function saltHashPassword(userpassword) {
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(userpassword, salt);
    console.log('UserPassword = '+userpassword);
    console.log('Passwordhash = '+passwordData.passwordHash);
    console.log('nSalt = '+passwordData.salt);

    return passwordData;

}


router.use(async function (req, res, next) {
  //console.log('Request Type:', req.type);
  mongoose.connect('mongodb://localhost/gameswapper', function (err) {

     if (err) throw err;

     console.log('Successfully connected');

   });
   var allItemsSanitize = [];
   allItemsSanitize = JSON.parse(JSON.stringify(await storedIDsDB.getStoredIDs()));

   console.log("Stored User ID: " + allItemsSanitize[0].userId);


   for (var i = 0; i < allItemsSanitize.length; i++) {
     allItemsSanitize[i].userId = req.sanitize(allItemsSanitize[i].userId);
     allItemsSanitize[i].offerID = req.sanitize(allItemsSanitize[i].offerID);
   }

   allIds = allItemsSanitize[0];

  next();
});

router.get('/signUp', function(req, res)
{
  var qs = req.query;
  var sessData = req.session;
  const errors = validationResult(req);

  var msg = JSON.parse(JSON.stringify(errors.array()));
  console.log(msg);

  if(sessData.theUser)
  {
    var user = sessData.theUser;
    res.render(path.resolve(__dirname, '../views') + '/myItems', {user: sessData.theUser, profile: sessData.currentProfile, userSwaps: sessData.userSwaps, errors: [{msg: "You must sign out to register"}]});
  }
  else
  {
    res.render(path.resolve(__dirname, '../views') + '/signUp', {user: "", errors: []});
  }
});

router.post('/signUp', [

  body('first').isAlpha().withMessage('First name must be only alphabetical chars')
                    .isLength({max: 40, min: 1}).withMessage('First name character length must be between 1 and 40'),

  body('last').isAlpha().withMessage('Last name must be only alphabetical chars')
                   .isLength({max: 40, min: 1}).withMessage('Last name character length must be between 1 and 40'),

  body('email').isEmail().withMessage('Email is not valid')
                .custom((value, { req }) => {
                    return UserModel.find({email: req.body.email}).then(user => {

                      if(user.length > 0)
                      {
                        console.log("Email is not available");
                        return Promise.reject('Email is already in use');
                      }
                      else
                      {
                        console.log("Email is available")
                      }
                    });
                  }),

  body('address1').isLength({max: 50}).withMessage('Address 1 must not exceed 50 chars'),

  body('address2').isLength({max: 50}).withMessage('Address 2 must not exceed 50 chars'),

  body('city').matches(/^[a-zA-Z ]+$/i).withMessage('City must be only alphabetical chars')
                .isLength({max: 40, min: 2}).withMessage('City character length must be between 2 and 40'),

  body('state').matches(/^[a-zA-Z ]+$/i).withMessage('State must be only alphabetical chars')
                  .isLength({max: 40, min: 2}).withMessage('State character length must be between 2 and 40'),

  body('zip').isNumeric().withMessage('Zipcode must be only numerical')
               .isLength({max: 5, min: 5}).withMessage('Zipcode must have a length of 5'),

  body('country').matches(/^[a-zA-Z ]+$/i).withMessage('Country must be only alphabetical chars')
                  .isLength({max: 40, min: 2}).withMessage('Country character length must be between 2 and 40'),

  body('password').matches(/^[a-zA-Z0-9 ]+$/i)
                .isLength({min: 7}).withMessage('Password character length must be a minimum of 7')
                .custom((value, { req }) => {
                    return UserModel.find({password: req.body.password}).then(user => {

                      if(user.length > 0)
                      {
                        console.log("Password is not available");
                        return Promise.reject('Password is already in use');
                      }
                      else
                      {
                        console.log("Password is available")
                      }
                    });
                  })
], function(req, res)
{
  var qs = req.body;
  var sessData = req.session;
  const errors = validationResult(req);

  var msg = JSON.parse(JSON.stringify(errors.array()));
  console.log("First: " + qs.first);

  console.log(msg);

  if(sessData.theUser)
  {
    var user = sessData.theUser;
    res.render(path.resolve(__dirname, '../views') + '/myItems', {user: sessData.theUser, profile: sessData.currentProfile, userSwaps: sessData.userSwaps, errors: [{msg: "You must sign out to register"}]});
  }
  else
  {
    if(errors.isEmpty())
    {

      var userNum = 0;


      var nUser = User.user(allIds.userId, qs.first, qs.last, qs.email, qs.address1, qs.address2, qs.city, qs.state, qs.zip, qs.country, qs.password);
      passwordData = saltHashPassword(qs.password);
      hashedPasswordDB.addHashedPassword(allIds.userId, qs.email, passwordData.passwordHash)
      userDB.addUser(nUser);
      userNum = ++allIds.userId;
      var offerNum = allIds.offerID;

      storedIDsDB.updateUserID(userNum, offerNum);

      res.render(path.resolve(__dirname, '../views') + '/login', {user: "", errors:[{msg: 'You have been successfully registered!'}]});
    }
    else
    {
      res.render(path.resolve(__dirname, '../views') + '/signUp', {user: "", errors: msg});
    }
  }
});


module.exports = router;
