var mongoose = require('mongoose'),
    CartProduct = require('../models/m_cart_product'),
    UserModel = require('../models/m_product_attribute'),
    Schema = mongoose.Schema;

var OrderSchema = new Schema({
    buyer       : [{
                    "type"      : Schema.ObjectId, 
                    "ref"       : 'User'     
                  }],
    products    : [{ 
                    "p_id"      : String,
                    "p_name"    : String,
                    "p_picture" : String,
                    "p_price"   : Number,
                    "p_discount": Number,
                    "p_quantity": Number,
                    "p_state"   : String,
                    "p_style"   : String,
                    "p_color"   : String,
                    "p_size"    : String
                   }],
    created     : { 
                    "type"      : Date, 
                    "default"   : Date.now 
                  }
});

var order = mongoose.model('Order', OrderSchema);

module.exports = order;
