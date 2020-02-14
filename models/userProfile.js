var userID;
var userItems;

var itemDB = require('./itemDB');
var Item = itemDB.item;

var userDB = require('./userDB');
var User = userDB.user;

var mongoose = require('mongoose');

var profile = function(userID, userItems)
{
  var userIDS = userID;
  var userItemsS = userItems;


  var getProperties = {
    getUserID: function(){var id = itemObj.userID; return id;},
    getUserItems: function(){var items = itemObj.userItems; return items;}
  };

  var setProperties = {
    setUserID: function(id){itemObj.userID = id;},
    setUserItems: function(items){itemObj.userItems = items;}
  };
  var otherFunctions = {
    removeUserItem: function(user, item){

      var codesArray = [];

      for(var i = 0; i < userItemsS.length; i++)
      {
        codesArray.push(userItemsS[i].code)
      }

        for(var i = 0; i < userItemsS.length; i++)
        {
          console.log("In Profile - Item Code: " + Item.code);
          console.log("In Profile - User list Item Code: " + userItemsS[i].code);

          if(item.code == userItemsS[i].code)
          {
            //userItemsS = userItemsS.splice(i, userItemsS.indexOf(Item));
            codesArray.splice(i, 1);
            userItemsS.splice(i, 1);

          }
        }

         User.find({
           userId: user.userId
         })
         .exec(function(err, users) {
                 if (err) throw err;
                 console.log("Update User: " + user);

                  console.log("New User Items: " + codesArray);
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
                     items: codesArray,
                     password: user.password
                   }, function(err, user) {

                  if (err) throw err;

                  console.log("User items has been updated");

                  });


                 console.log(user);
                 });

       return userItemsS;
    },
    emptyProfile: function(){},
    addUserItem: function(userItem){
      userItemsS.push(userItem);

      mongoose.connect('mongodb://localhost/gameswapper', function (err) {

         if (err) throw err;

         console.log('Successfully connected');

         User.find({
           userId: itemObj.userID
         })
         .exec(function(err, user) {
                 if (err) throw err;

                 User.findOneAndUpdate({userId: itemObj.userID},
                   {
                     fname: user.fname,
                     lname: user.lname,
                     email: user.email,
                     address1: user.address1,
                     address2: user.address2,
                     city: user.city,
                     stateReg: user.stateReg,
                     postCode: user.postCode,
                     country: user.country,
                     items: userItemS,
                     password: user.password
                   }, function(err, user) {

                  if (err) throw err;

                  console.log("User items has been updated");

                  });


                 console.log(user);
                 });
       });

      return userItemsS;
    }
  }
//return item(itemObj.code, name, itemObj.categoryS, itemObj.descriptionS, itemObj.ratingS, itemObj.imageUrlS);


  var itemObj = {
  userID: userIDS,
  userItems: userItemsS,
  get: getProperties,
  set: setProperties,
  other: otherFunctions};

  return itemObj;

};



module.exports.profile = profile;
