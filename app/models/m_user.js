var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt');
 
 
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
                    "type"      : Number,
                    "default"   : 0 // 0 normal user, 1 seller user, 2 normal by social, 3 seller by social 
                },
    birthday:   {
                    "type"      : Date,
                    "default"   : Date.now 
                },
    username:   {
                    "type"      : String,
                    "unique"    : true,
                    "required"  : true
                },
    password:   {
                    "type": String,
                    "required": true
                }
});

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