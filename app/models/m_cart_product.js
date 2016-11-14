var mongoose = require('mongoose'),
    ProductAttribute = require('../models/m_product_attribute'),
    Product = require('../models/m_product_attribute'),
    Schema = mongoose.Schema;

var CartProductSchema = new Schema({
    product     : { 
                    "type"      : Schema.ObjectId, 
                    "ref"       : 'Product',
                    "validate"  : [ minLengthValidation, '{PATH} must have at least 1 item' ]
                   },
    attribute    : { 
                    "type"      : Schema.ObjectId, 
                    "ref"       : 'Product_Attribute',
                    "validate"  : [ minLengthValidation, '{PATH} must have at least 1 item' ]
                   },
    quantity    : {
                    "type"      : Number,
                    "default"   : 0
                  },
    created     : { 
                    "type"      : Date, 
                    "default"   : Date.now 
                  }
});

function minLengthValidation(val) {
  return val.length >= 1 || val != null;
}

var cartProduct = mongoose.model('Cart_Product', CartProductSchema);

module.exports = cartProduct;
