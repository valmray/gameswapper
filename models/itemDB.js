// var sfv = {name: "Street Fighter V",
//            code: 1,
//            category: "Fighter",
//            description: "Experience the intensity of head-to-head battles with Street Fighter® V! Choose iconic characters, then battle against friends online or offline with a robust variety of match options.",
//            rating: "3",
//            imageUrl: "/resources/sfvBox.jpg"};
//
// var umvc3 = {name: "Ultimate Marvel vs. Capcom 3",
//              code: 2,
//              category: "Fighter",
//              description: "Marvel and Capcom join forces to deliver the most frenetic 3 vs 3 tag battles ever with Ultimate Marvel VS Capcom 3.",
//              rating: "5",
//              imageUrl: "/resources/umvc3Box.jpg"};
//
// var dbfz = {name: "Dragon Ball Fighterz",
//             code: 3,
//             category: "Fighter",
//             description: "DRAGON BALL FighterZ is born from what makes the DRAGON BALL series so loved and famous: endless spectacular fights with its allpowerful fighters. Partnering with Arc System Works, DRAGON BALL FighterZ maximizes high end Anime graphics and brings easy to learn but difficult to master fighting gameplay to audiences worldwide.",
//             rating: "4",
//             imageUrl: "/resources/dbfzBox.jpg"};
//
//
//  var mo = {name: "Mario Odyssey",
//            code: 4,
//            category: "Platformer",
//            description: "Explore incredible places far from the Mushroom Kingdom as you join Mario and his new ally Cappy on a massive, globe-trotting 3D adventure. Use amazing new abilities—like the power to capture and control objects, animals, and enemies—to collect Power Moons so you can power up the Odyssey airship and save Princess Peach from Bowser's wedding plans!",
//            rating: "5",
//            imageUrl: "/resources/super-mario-boxart.jpg"};
//
//  var sk = {name: "Shovel Knight",
//            code: 5,
//            category: "Platformer",
//            description: "Shovel Knight is a sweeping classic action adventure game series with awesome gameplay, memorable characters, and an 8-bit retro aesthetic.",
//            rating: "5",
//            imageUrl: "/resources/skBox.jpg"};
//
//  var smb = {name: "Super Meat Boy",
//             code: 6,
//             category: "Platformer",
//             description: "Super Meat Boy is a tough as nails platformer where you play as an animated cube of meat who's trying to save his girlfriend (who happens to be made of bandages) from an evil fetus in a jar wearing a tux.",
//             rating: "4",
//             imageUrl: "/resources/smbBox.png"};
//
//
//  var ffx = {name: "Final Fantasy X",
//             code: 7,
//             category: "RPG",
//             description: "Final Fantasy X is a role-playing video game developed and published by Square as the tenth entry in the Final Fantasy series. Set in the fantasy world of Spira, a setting influenced by the South Pacific, Thailand and Japan,[1] the game's story revolves around a group of adventurers and their quest to defeat a rampaging monster known as Sin.",
//             rating: "4",
//             imageUrl: "/resources/ffxBox.jpg"};
//
//  var pkmss = {name: "Pokemon Soul Silver",
//               code: 8,
//               category: "RPG",
//               description: "Pokémon SoulSilver Version are enhanced remakes of the 1999 video game Pokémon Silver, including the features in Pokémon Crystal.",
//               rating: "5",
//               imageUrl: "/resources/pkmssBox.jpg"};
//
//  var ot = {name: "Octopath Traveler",
//            code: 9,
//            category: "RPG",
//            description: "Step into the roles of eight different travelers as you explore and battle your way across this expansive realm. Choose your character and focus on his or her story, or delve into each of the seven other characters’ tales as you meet them on your journey. Add the other travelers to your party or go it alone—the choice is yours.",
//            rating: "4",
//            imageUrl: "/resources/optBox.jpg"};
var ItemModel = require('./item');

var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
           //autoIncrement.initialize(mongoose.connection);
           //CounterSchema.plugin(autoIncrement.plugin, 'Counter');
           //var Counter = mongoose.model('Counter', CounterSchema);

var itemSchema = mongoose.Schema({
             name: String,
             code: Number,
             category: String,
             description: String,
             rating: Number,
             imageUrl: String
           });

var Item = mongoose.model('Item', itemSchema);
autoIncrement.initialize(mongoose.createConnection('mongodb://localhost/gameswapper'));



var items;
var itemResult = [];

var getAllItems = async function()
{
  itemResult = await Item.find().then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  //console.log(itemResult[0]);
  return itemResult;
};

// var getAllItems = function(items)
// {
//   return items;
// };

var getItem = async function(itemID)
{
  itemResult = await Item.find({code: itemID}).then(function(result) {
    return result;
  //console.log(result); // "Stuff worked!"
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  //console.log(itemResult[0]);
  return itemResult[0];

};

var addItem = function(itemCode, itemName, categoryCode, catalogCategory, descriptionS, imageUrlS, ratingS)
{
     var newItem = ItemModel.item(itemCode, itemName, catalogCategory, descriptionS, ratingS, imageUrlS);

     addItem(newItem);
};

var addItem = function(item)
{
  mongoose.connect('mongodb://localhost/gameswapper', function (err) {

     if (err) throw err;

     console.log('Successfully connected');

     var newItem = new Item ({
       name: item.name,
       code: item.code,
       category: item.category,
       description: item.description,
       rating: item.rating,
       imageUrl: item.imageUrl
     });

     //userSchema.plugin(autoIncrement.plugin, { model: newUser, field: 'userId' });

     newItem.save(function(err) {
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

module.exports.item = Item;
module.exports.getAllItems = getAllItems;
module.exports.getItem = getItem;
module.exports.addItem = addItem;
