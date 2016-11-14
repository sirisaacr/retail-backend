var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name        : {
                    "type"      : String,
                    "required"  : [true, 'Product name required'] 
                  },
    created     : { 
                    "type"      : Date, 
                    "default"   : Date.now 
                  }
});

var category = mongoose.model('Category', CategorySchema);

module.exports = category;

