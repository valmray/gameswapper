// var bob = {
// userId: 1,
// fname: "Bob",
// lname: "Smith",
// email: "bob@email.com",
// address1: "bob address 1",
// address2: "bob address 2",
// city: "Raleigh",
// stateReg: "NC",
// postCode: 12345,
// country: "US",
// items: [1,4,7],
// password: "bp"};
//
// var richard = {
// id: 2,
// fname: "Richard",
// lname: "Wilson",
// email: "richard@email.com",
// address1: "richard address 1",
// address2: "richard address 2",
// city: "New York City",
// stateReg: "NY",
// postCode: 23456,
// country: "US",
// items: [2,5,8],
// password: "rp"};
//
// var annie = {
// id: 3,
// fname: "Annie",
// lname: "Wood",
// email: "annie@email.com",
// address1: "annie address 1",
// address2: "annie address 2",
// city: "Los Angeles",
// stateReg: "CA",
// postCode: 34567,
// country: "US",
// items: [3,6,9],
// password: "ap"};
var UserProfile = require('./userProfile');
var UserModel = require('./user');
var itemDB = require('./itemDB');
var Item = itemDB.item;

var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
//autoIncrement.initialize(mongoose.connection);
//CounterSchema.plugin(autoIncrement.plugin, 'Counter');
//var Counter = mongoose.model('Counter', CounterSchema);

var userSchema = mongoose.Schema({
  userId: Number,
  fname: String,
  lname: String,
  email: String,
  address1: String,
  address2: String,
  city: String,
  stateReg: String,
  postCode: Number,
  country: String,
  items: Array,
  password: String
});

var User = mongoose.model('User', userSchema);
//var users = [bob, richard, annie];

var getAllUsers = async function()
{
  var usersResult = await User.find().then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  return usersResult;
};

var getUserProfile = async function(userID)
{
  var itemProfile = [];
  // Error: "It broke"
console.log("Get: " +  userID);
  var userResult = await User.find({userId: userID}).then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  if(userResult.length > 0 && userResult != null)
  {
    console.log("Length: " + userResult[0].items.length);
    var counter = 0;

     while(counter != userResult[0].items.length)
     {
       var userResult2 = await Item.find({code: userResult[0].items[counter]}).then(function(result) {
         return result;
       //console.log(result); // "Stuff worked!"
       }, function(err) {
         console.log(err); // Error: "It broke"
       });

       console.log(counter);

       counter++;
       itemProfile.push(userResult2[0]);
     }

   var profile = UserProfile.profile(userID, itemProfile);

   console.log("Profile ID: " + profile.userID);
   //console.log("Profile Items: " + profile.userItems);

   return UserProfile.profile(userID, itemProfile);

  }
  else
  {
    var profile = UserProfile.profile(0, []);

    return profile;
  }

 };

var addUser = function(firstName, lastName, emailS, address1S, address2S, cityS, state, zipcode, countryS, passwordS)
{

  //var newUser = UserModel.user(id, firstName, lastName, emailS, address1S, address2S, cityS, state, zipcode, countryS);
  //addUser(newUser);

  mongoose.connect('mongodb://localhost/gameswapper', function (err) {

     if (err) throw err;

     console.log('Successfully connected');

     var newUser = new User ({
       fname: firstName,
       lname: lastName,
       email: emailS,
       address1: address1S,
       address2: address2S,
       city: cityS,
       stateReg: state,
       postCode: zipcode,
       country: countryS,
       items: [],
       password: passwordS
     });


     newUser.save(function(err) {
          if (err)
          {
            console.log('Student not successfully saved.');
             throw err;
          }
          else
          {
             console.log('Student successfully saved.');
          }

      });
   });
};


var addUser = function(user)
{
  mongoose.connect('mongodb://localhost/gameswapper', function (err) {

     if (err) throw err;

     console.log('Successfully connected');
     var newUser = new User ({
       userId: user.id,
       fname: user.fname,
       lname: user.lname,
       email: user.email,
       address1: user.address1,
       address2: user.address2,
       city: user.city,
       stateReg: user.stateReg,
       postCode: user.postCode,
       country: user.country,
       items: user.items,
       password: user.password
     });

     userSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'userId' });

     newUser.save(function(err) {
          if (err)
          {
            console.log('User not successfully saved.');
             throw err;
          }
          else
          {
             console.log('User successfully saved.');
          }

      });
   });
};


var getUser = async function(userID)
{
  userResult = await User.find({userId: userID}).then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  //console.log(itemResult[0]);
  return userResult;
};

var updateUser = function(user)
{
  User.findOneAndUpdate({userId: user.userId},
    {
      userId: user.userId,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      address1: user.address1,
      address2: user.address2,
      city: user.city,
      stateReg: user.stateReg,
      postCode: user.postCode,
      country: user.country,
      items: userItems,
      password: user.password
    }, function(err, offer) {

   if (err) throw err;

   console.log("User has been updated");

   });
};

var swapUserItems = function(user, swapper, userItemCode, swapperItemCode)
{
  var userItems = [];
  userItems = user.items;

  var swapperItems = [];
  swapperItems = swapper.items;

  for(var i = 0; i < user.items.length; i++)
  {
    if(user.items[i] == userItemCode)
    {
      userItems.splice(i, 1);
    }
  }

  userItems.push(swapperItemCode);

  for(var i = 0; i < swapper.items.length; i++)
  {
    if(swapper.items[i] == swapperItemCode)
    {
      swapperItems.splice(i, 1);
    }
  }

  swapperItems.push(userItemCode);

  User.findOneAndUpdate({userId: swapper.userId},
    {
      userId: user.userId,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      address1: user.address1,
      address2: user.address2,
      city: user.city,
      stateReg: user.stateReg,
      postCode: user.postCode,
      country: user.country,
      items: userItems,
      password: user.password
    }, function(err, offer) {

   if (err) throw err;

   console.log("User item has been swapped");

   });

   User.findOneAndUpdate({userId: userID},
     {
       userId: swapper.userId,
       fname: swapper.fname,
       lname: swapper.lname,
       email: swapper.email,
       address1: swapper.address1,
       address2: swapper.address2,
       city: swapper.city,
       stateReg: swapper.stateReg,
       postCode: swapper.postCode,
       country: swapper.country,
       items: swapperItems,
       password: swapper.password
     }, function(err, offer) {

    if (err) throw err;

    console.log("Swapper item has been swapped");

    });
};


module.exports.user = User;
module.exports.getAllUsers = getAllUsers;
module.exports.getUserProfile = getUserProfile;
module.exports.addUser = addUser;
module.exports.getUser = getUser;
