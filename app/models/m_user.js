var mongoose        = require('mongoose'),
    Schema          = mongoose.Schema,
    bcrypt          = require('bcrypt'),
    Cart            = require('../models/m_cart'),
    validator       = require('validator');;
 
 
// Defining the mongoose model
var UserSchema = new Schema({
    name:       {
                    "type"      : String,
                    "required"    : true
                },
    lastname:   {
                    "type"      : String,
                    "required"    : true
                },
    type:       {
                    "type"      : Boolean,
                    "default"   : false // false is normal, true is seller 
                },
    email:      {
                    "type"      : String,
                    "lowercase" : true,
                    "unique"    : true,
                    "required"  : true,
                    "validate"  : [validateEmail, 'The email address is not valid'],
                },
    username:   {
                    "type"      : String,
                    "unique"    : true,
                    "required"  : true
                },
    password:   {
                    "type": String,
                    "required": true
                },
    cart:       { 
                    "type"      : Schema.ObjectId, 
                    "ref"       : 'Cart'
                }
});

// This validates de email inserted by the user
function validateEmail(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

// This converts the password to a hash before its saved to the database
UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(16, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// This compare the password for authentication with the database hash
UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);