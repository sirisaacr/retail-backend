var mongoose = require('mongoose');

var AttributeSchema = mongoose.Schema({
    price       : {
                    "type"     : Number,
                    "required" : [true, 'Product price required'] 
                  },
    discount    : {
                    "type"     : Number,
                    "default"  : 0 
                  },
    stock       : {
                    "type"     : Number,
                    "default"  : 0 
                  },
    state       : {
                    "type"     : Number,
                    "default"  : 0 
                  },
    style       : {
                    "type"     : Number,
                    "default"  : 0  
                  },
    color       : {
                    "type"     : String,
                    "default"  : "No color" 
                  },
    size        : {
                    "type"     : String,
                    "default"  : "No size" 
                  },
    created     : { 
                    "type"      : Date, 
                    "default"   : Date.now 
                  }
});

var attribute = mongoose.model('Product_Attribute', AttributeSchema);

module.exports = attribute;

// attribute
// {
//     price       : 100,
//     discount    : 10,
//     stock       : 15,
//     state       : 'New',
//     style       : 'Men',
//     color       : 'Black',
//     Size        : 'L'
// }