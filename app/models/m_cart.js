var mongoose = require('mongoose'),
    CartProduct = require('../models/m_cart_product'),
    UserModel = require('../models/m_product_attribute'),
    Schema = mongoose.Schema;

var CartSchema = new Schema({
    products    : [{ 
                    "type"      : Schema.ObjectId, 
                    "ref"       : 'Cart_Product'
                   }],
    created     : { 
                    "type"      : Date, 
                    "default"   : Date.now 
                  }
});

var cart = mongoose.model('Cart', CartSchema);

module.exports = cart;
