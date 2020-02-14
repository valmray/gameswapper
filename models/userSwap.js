//user who initiated the swap
var userID;

var swapperID;
var userItem;
var rating;

//this attribute should indicate swap item status – available, pending (offer made),swapped (offer accepted)
var status;

//this is the item swapped with this user item (an item that was offered for swapping by another user and was swapped with this user item).
var swapItem;

//this is the user’s rating for the item swapped with this user item
var swapItemRating;

//this is the user’s rating for the other user that owns the item swapped with this user item
var swapperRating;

var swap1 = {
  userItem: {name: "Street Fighter V",
             code: 1,
             category: "Fighter",
             description: "Experience the intensity of head-to-head battles with Street Fighter® V! Choose iconic characters, then battle against friends online or offline with a robust variety of match options.",
             rating: "3",
             imageUrl: "/resources/sfvBox.jpg"},
  rating: 3,
  status: "available",
  swapItem: {name: "Ultimate Marvel vs. Capcom 3",
               code: 2,
               category: "Fighter",
               description: "Marvel and Capcom join forces to deliver the most frenetic 3 vs 3 tag battles ever with Ultimate Marvel VS Capcom 3.",
               rating: "5",
               imageUrl: "/resources/umvc3Box.jpg"},
  swapItemRating: 4,
  swapperRating: 3
};

var swap2 = {
  userItem: {name: "Super Meat Boy",
             code: 6,
             category: "Platformer",
             description: "Super Meat Boy is a tough as nails platformer where you play as an animated cube of meat who's trying to save his girlfriend (who happens to be made of bandages) from an evil fetus in a jar wearing a tux.",
             rating: "4",
             imageUrl: "/resources/smbBox.png"},
  rating: 3,
  status: "available",
  swapItem: {name: "Super Meat Boy",
             code: 6,
             category: "Platformer",
             description: "Super Meat Boy is a tough as nails platformer where you play as an animated cube of meat who's trying to save his girlfriend (who happens to be made of bandages) from an evil fetus in a jar wearing a tux.",
             rating: "4",
             imageUrl: "/resources/smbBox.png"},
  swapItemRating: 5,
  swapperRating: 4
};

var swap3 = {
  userItem: {name: "Final Fantasy X",
             code: 7,
             category: "RPG",
             description: "Final Fantasy X is a role-playing video game developed and published by Square as the tenth entry in the Final Fantasy series. Set in the fantasy world of Spira, a setting influenced by the South Pacific, Thailand and Japan,[1] the game's story revolves around a group of adventurers and their quest to defeat a rampaging monster known as Sin.",
             rating: "4",
             imageUrl: "/resources/ffxBox.jpg"},
  rating: 5,
  status: "available",
  swapItem: {name: "Pokemon Soul Silver",
               code: 8,
               category: "RPG",
               description: "Pokémon SoulSilver Version are enhanced remakes of the 1999 video game Pokémon Silver, including the features in Pokémon Crystal.",
               rating: "5",
               imageUrl: "/resources/pkmssBox.jpg"},
  swapItemRating: 4,
  swapperRating: 5
};

var userSwap = function(userID, swapperID, userItem, rating, status, swapItem, swapItemRating, swapperRating)
{
  var userIDS = userID;
  var swapperIDS = swapperID;
  var userItemS = userItem;
  var ratingS = rating;
  var statusS = status;
  var swapItemS = swapItem;
  var swapItemRatingS = swapItemRating;
  var swapperRatingS = swapperRating;

  //
  // this.userItem = userItem;
  // this.rating = rating;
  // this.status = status;
  // this.swapItem = swapItem;
  // this.swapItemRating = swapItemRating;
  // this.swapperRating = swapperRating;

  var getProperties = {
    getUserID: function(){var fname = itemObj.userID; return fname;},
    getUserItem: function(){var fname = itemObj.userItem; return fname;},
    getRating: function(){var lname = itemObj.rating; return lname;},
    getStatus: function(){var code = itemObj.status; return code;},
    getSwapItem: function(){var category = itemObj.swapItem; return category;},
    getSwapItemRating: function(){var description = itemObj.swapItemRating; return description;},
    getSwapperRating: function(){var rating = itemObj.swapperRating; return rating;},

  }
//return item(itemObj.code, name, itemObj.categoryS, itemObj.descriptionS, itemObj.ratingS, itemObj.imageUrlS);
  var setProperties = {

    setUserItem: function(name){itemObj.userItem = name;},
    setRating: function(code){itemObj.rating = code;},
    setStatus: function(category){itemObj.status = category;},
    setSwapItem: function(description){itemObj.swapItem = description;},
    setSwapItemRating: function(rating){itemObj.swapItemRating = rating;},
    setSwapperRating: function(imageUrl){itemObj.swapperRating = imageUrl;}

  }

  var itemObj = {
  userID: userIDS,
  swapperID: swapperIDS,
  userItem: userItemS,
  rating: ratingS,
  status: statusS,
  swapItem: swapItemS,
  swapItemRating: swapItemRatingS,
  swapperRating: swapperRatingS,
  get: getProperties,
  set: setProperties};

  return itemObj;

}

module.exports.userSwap = userSwap;
