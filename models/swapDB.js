var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');


var swapSchema = mongoose.Schema({
  offerID: Number,
  userItem: Object,
  rating: Number,
  status: String,
  swapItem: Object,
  swapItemRating: Number,
  swapperRating: Number
});

var Swap = mongoose.model('Swap', swapSchema);
var getAllSwaps = async function()
{
  swapResult = await Swap.find().then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  //console.log(itemResult[0]);
  return swapResult;
};
var addSwap = function(offerIDS, swapItems, statusS, itemRating, swapItemRatingS, swapperRatingS, which)
{
  if(which == 0)
  {
    var newSwap = new Swap ({
      offerID: offerIDS,
      userItem: swapItems.itemCodeWant,
      rating: swapItemRatingS,
      status: statusS,
      swapItem: swapItems.itemCodeOwn,
      swapItemRating: itemRating,
      swapperRating: swapperRatingS
    });


    newSwap.save(function(err) {
         if (err)
         {
           console.log('Swap not successfully saved.');
            throw err;
         }
         else
         {
            console.log('Swap successfully saved.');
         }

     });
  }
  else
  {
    var newSwap = new Swap ({
      offerID: offerIDS,
      userItem: swapItems.itemCodeOwn,
      rating: itemRating,
      status: statusS,
      swapItem: swapItems.itemCodeWant,
      swapItemRating: swapItemRatingS,
      swapperRating: swapperRatingS
    });


    newSwap.save(function(err) {
         if (err)
         {
           console.log('Swap not successfully saved.');
            throw err;
         }
         else
         {
            console.log('Swap successfully saved.');
         }

     });
  }


}
module.exports.swap = Swap;
module.exports.addSwap = addSwap;
module.exports.getAllSwaps = getAllSwaps;
