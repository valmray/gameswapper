var mongoose = require('mongoose');


var hashedPasswordSchema = mongoose.Schema({
  email: String,
  userID: Number,
  hashedPassword: String

});

var HashedPassword = mongoose.model('HashedPassword', hashedPasswordSchema, 'hashedPasswords');

var addHashedPassword = function(userId, emailS, hashedPasswordS)
{
  var newHashedPassword = new HashedPassword ({
    userID: userId,
    email: emailS,
    hashedPassword: hashedPasswordS
  });


  newHashedPassword.save(function(err) {
       if (err)
       {
         console.log('Hashed password not successfully saved.');
          throw err;
       }
       else
       {
          console.log('Hashed password successfully saved.');
       }

   });

};

module.exports.addHashedPassword = addHashedPassword;
module.exports.hashedPassword = HashedPassword;
