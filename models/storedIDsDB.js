var mongoose = require('mongoose');


var storedIDSchema = mongoose.Schema({
  //userId: Number,
  userId: Number,
  offerID: Number
});

var StoredId = mongoose.model('StoredId', storedIDSchema, 'storedIds');

var getStoredIDs = async function()
{

  var idResult = [];
  idResult = await StoredId.find().then(function(result) {
    //console.log("Stored User ID: " + result[0].userId);

    return result;
  }, function(err) {
    console.log(err);
  });


  return idResult;
}

var updateUserID = async function (userIDS, offerIDS)
{
             StoredId.findOneAndUpdate({offerID: offerIDS},
               {
                 userId: userIDS,
                 offerID: offerIDS
               }, function(err, offer) {

              if (err) throw err;

              console.log("User id has been updated");

              });

};

var updateOfferID = async function (userIDS, offerIDS)
{

             StoredId.findOneAndUpdate({userId: userIDS},
               {
                 userId: userIDS,
                 offerID: offerIDS
               }, function(err, offer) {

              if (err) throw err;

              console.log("Offer ID has been updated");

              });



};

module.exports.storedID = StoredId;
module.exports.updateUserID = updateUserID;
module.exports.updateOfferID = updateOfferID;
module.exports.getStoredIDs = getStoredIDs;
