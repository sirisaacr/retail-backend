var mongoose = require('mongoose'),
    Product = require('../models/m_product'),
    CartProduct = require('../models/m_cart_product');

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
                    "type"     : String,
                    "default"  : 'No State' 
                  },
    style       : {
                    "type"     : String,
                    "default"  : 'No style'
                  },
    color       : {
                    "type"     : String,
                    "default"  : "No color" 
                  },
    size        : {
                    "type"     : String,
                    "default"  : "No size" 
                  },
    active      : {
                    "type"     : Boolean,
                    "default"  : true
                  },
    created     : { 
                    "type"      : Date, 
                    "default"   : Date.now 
                  }
});

var attribute = mongoose.model('Product_Attribute', AttributeSchema);

// AttributeSchema.pre('update', function(next) {
//     // Remove all the assignment docs that reference the removed person.
//     this.model('Product').update({ attributes: { $in: [ this._id ] } },
//                                                { $pull: { attributes: this._id } }, 
//                                                { multi: true },  
//                                                next);
// });

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