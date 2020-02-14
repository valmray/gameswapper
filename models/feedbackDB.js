
var mongoose = require('mongoose');

var offerFeedbackSchema = mongoose.Schema({
  offerID: Number,
  userID: Number,
  swapperID: Number,
  rating: Number
});

var itemFeedbackSchema = mongoose.Schema({
  itemCode: Number,
  userID: Number,
  rating: Number
});

var OfferFeedback = mongoose.model('offerFeedback', offerFeedbackSchema, 'offerFeedback');
var ItemFeedback = mongoose.model('itemFeedback', itemFeedbackSchema, 'itemFeedback');

var addOfferFeedback = function (offerIDS, userID1S, userID2S, ratingS)
{
  mongoose.connect('mongodb://localhost/gameswapper', function (err) {

     if (err) throw err;

     console.log('Successfully connected');

     var newOfferFeedback = new OfferFeedback ({
       offerID: offerIDS,
       userID: userID1S,
       swapperID: userID2S,
       rating: ratingS
     });

     newOfferFeedback.save(function(err) {
          if (err)
          {
            console.log('Offer feedback not successfully saved.');
             throw err;
          }
          else
          {
             console.log('Offer feedback successfully saved.');
          }

      });
   });
};

var addItemFeedback = function (itemCodeS, userIDS, ratingS)
{
  mongoose.connect('mongodb://localhost/gameswapper', function (err) {

     if (err) throw err;

     console.log('Successfully connected');



     var newItemFeedback = new ItemFeedback ({
       itemCode: itemCodeS,
       userID: userIDS,
       rating: ratingS
     });

     newItemFeedback.save(function(err) {
          if (err)
          {
            console.log('Item feedback not successfully saved.');
             throw err;
          }
          else
          {
             console.log('Item feedback successfully saved.');
          }

      });
   });
};

var getAllItemFeedback = async function()
{
  itemResult = await ItemFeedback.find().then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  //console.log(itemResult[0]);
  return itemResult;
};

var updateItemFeedback = function(itemCodeS, userIDS, ratingS)
{

    ItemFeedback.findOneAndUpdate({userID: userIDS, itemCode: itemCodeS},
    {
      userID: userIDS,
      itemCode: itemCodeS,
      rating: ratingS
    }, function(err, offer) {

        if (err) throw err;

        console.log("Item feedback has been updated");

        });
};

var getAllOfferFeedback = async function()
{
  itemResult = await OfferFeedback.find().then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  //console.log(itemResult[0]);
  return itemResult;
};

var updateOfferFeedback = function(offerIDS, userID1S, userID2S, ratingS)
{

    OfferFeedback.findOneAndUpdate({userID: userID1S, swapperID: userID2S},
    {
      offerID: offerIDS,
      userID: userID1S,
      swapperID: userID2S,
      rating: ratingS
    }, function(err, offer) {

        if (err) throw err;

        console.log("Offer feedback has been updated");

        });
};

var getOfferFeedback = async function(userId, swapperId)
{
  itemResult = await OfferFeedback.find({userID: userId, swapperID: swapperId}).then(function(result) {
    console.log("Feedback User ID: " + result[0].userID);

    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  //console.log(itemResult[0]);
  return itemResult[0];
};

var getItemFeedback = async function(itemCodeS, userId)
{
  itemResult = await ItemFeedback.find({itemCode: itemCodeS, userID: userId}).then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  //console.log(itemResult[0]);
  return itemResult[0];
};

module.exports.offerFeedback = OfferFeedback;
module.exports.itemFeedback = ItemFeedback;
module.exports.addOfferFeedback = addOfferFeedback;
module.exports.addItemFeedback = addItemFeedback;
module.exports.updateItemFeedback = updateItemFeedback;
module.exports.getAllItemFeedback = getAllItemFeedback;
module.exports.updateOfferFeedback = updateOfferFeedback;
module.exports.getAllOfferFeedback = getAllOfferFeedback;
module.exports.getItemFeedback = getItemFeedback;
module.exports.getOfferFeedback = getOfferFeedback;
