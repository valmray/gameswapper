var fname;
var fname;
var id;
var email;
var address1;
var address2;
var city;
var stateReg;
var postCode;
var country;
var password;




var user = function(id, fname, lname, email, address1, address2, city, stateReg, postCode, country, password)
{
  var idS = id;
  var fnameS = fname;
  var lnameS = lname;
  var emailS = email;
  var address1S = address1;
  var address2S = address2;
  var cityS = city;
  var stateRegS = stateReg;
  var postCodeS = postCode;
  var countryS = country;
  var passwordS = password;

  var getProperties = {
    getFname: function(){var fname = itemObj.fname; return fname;},
    getLname: function(){var lname = itemObj.lname; return lname;},
    getId: function(){var code = itemObj.id; return code;},
    getEmail: function(){var category = itemObj.email; return category;},
    getAddress1: function(){var description = itemObj.address1; return description;},
    getAddress2: function(){var rating = itemObj.address2; return rating;},
    getCity: function(){var imageUrl = itemObj.city; return imageUrl;},
    getStateReg: function(){var description = itemObj.stateReg; return description;},
    getPostCode: function(){var rating = itemObj.postCode; return rating;},
    getCountry: function(){var imageUrl = itemObj.country; return imageUrl;}
  }
//return item(itemObj.code, name, itemObj.categoryS, itemObj.descriptionS, itemObj.ratingS, itemObj.imageUrlS);
  var setProperties = {
    setFname: function(name){itemObj.fname = name;},
    setLname: function(code){itemObj.lname = code;},
    setId: function(category){itemObj.id = category;},
    setEmail: function(description){itemObj.email = description;},
    setAddress1: function(rating){itemObj.address1 = rating;},
    setAddress2: function(imageUrl){itemObj.address2 = imageUrl;},
    setCity: function(category){itemObj.city = category;},
    setCity: function(description){itemObj.stateReg = description;},
    setPostCode: function(rating){itemObj.postCode = rating;},
    setCountry: function(imageUrl){itemObj.country = imageUrl;}
  }

  var itemObj = {
  id: idS,
  fname: fnameS,
  lname: lnameS,
  email: emailS,
  address1: address1S,
  address2: address2S,
  city: cityS,
  stateReg: stateRegS,
  postCode: postCodeS,
  country: countryS,
  password: passwordS,
  get: getProperties,
  set: setProperties};

  return itemObj;

}

module.exports.user = user;
