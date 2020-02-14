//
// var offer1 = {
//   userID: 1,
//   itemCodeOwn: 1,
//   itemCodeWant: 2,
//   itemStatus: "pending"
// };
//
// var offer2 = {
//   userID: 2,
//   itemCodeOwn: 4,
//   itemCodeWant: 5,
//   itemStatus: "available"
// };
//
// var offer3 = {
//   userID: 3,
//   itemCodeOwn: 6,
//   itemCodeWant: 7,
//   itemStatus: "pending"
// };

var mongoose = require('mongoose');


var offerSchema = mongoose.Schema({
  offerID: Number,
  userID: Number,
  swapperID: Number,
  itemCodeOwn: Number,
  itemCodeWant: Number,
  itemStatus: String
});

var Offer = mongoose.model('Offer', offerSchema);
//var users = [bob, richard, annie];
var getAllOffers = async function()
{

  offerResult = await Offer.find().then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  //console.log(itemResult[0]);
  return offerResult;
};

var addOffer = async function (userId, swapperId, itemCodeOwnS, itemCodeWantS, itemStatusS, offerIDS)
{


     var newOffer = new Offer ({
       userID: userId,
       swapperID: swapperId,
       itemCodeOwn: itemCodeOwnS,
       itemCodeWant: itemCodeWantS,
       itemStatus: itemStatusS,
       offerID: offerIDS
     });


     newOffer.save(function(err) {
          if (err)
          {
            console.log('Offer not successfully saved.');
             throw err;
          }
          else
          {
             console.log('Offer successfully saved.');
          }

      });

};

var updateOffer = async function (offerIDS, itemStatusS, offers)
{

  var offers1 = await Offer.find({
    offerIDS: offerIDS
  }).then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  //var offers = JSON.parse(JSON.stringify(offers1));
  console.log("Status: " + itemStatusS); // Error: "It broke"


             Offer.findOneAndUpdate({offerID: offerIDS},
               {
                 offerID: offerIDS,
                 userID: offers.userID,
                 swapperID: offers.swapperID,
                 itemCodeOwn: offers.itemCodeWant.code,
                 itemCodeWant: offers.itemCodeOwn.code,
                 itemStatus: itemStatusS
               }, function(err, offer) {

              if (err) throw err;

              console.log("Offer status has been updated");

              });



};

var getOffer = async function (offerIDS)
{

  var offers1 = await Offer.find({
    offerID: offerIDS
  }).then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  return offers1[0];
};

module.exports.offer = Offer;
module.exports.addOffer = addOffer;
module.exports.updateOffer = updateOffer;
module.exports.getAllOffers = getAllOffers;
module.exports.getOffer = getOffer;
