var name;
var code;
var category;
var description;
var rating;
var imageUrl;

var item = function(code, name, category, description, rating, imageUrl)
{
  var nameS = name;
  var codeS = code;
  var categoryS = category;
  var descriptionS = description;
  var ratingS = rating;
  var imageUrlS = imageUrl;

  var getProperties = {
    getName: function(){var name = itemObj.name; return name;},
    getCode: function(){var code = itemObj.code; return code;},
    getCategory: function(){var category = itemObj.category; return category;},
    getDescription: function(){var description = itemObj.description; return description;},
    getRating: function(){var rating = itemObj.rating; return rating;},
    getImageUrl: function(){var imageUrl = itemObj.imageUrl; return imageUrl;}
  }
//return item(itemObj.code, name, itemObj.categoryS, itemObj.descriptionS, itemObj.ratingS, itemObj.imageUrlS);
  var setProperties = {
    setName: function(name){itemObj.name = name;},
    setCode: function(code){itemObj.code = code;},
    setCategory: function(category){itemObj.category = category;},
    setDescription: function(description){itemObj.description = description;},
    setRating: function(rating){itemObj.rating = rating;},
    setImageUrl: function(imageUrl){itemObj.imageUrl = imageUrl;}
  }

  var itemObj = {name: nameS,
  code: codeS,
  category: categoryS,
  description: descriptionS,
  rating: ratingS,
  imageUrl: imageUrlS,
  get: getProperties,
  set: setProperties};

  return itemObj;

}

module.exports.item = item;
