var mongoose = require('mongoose'),
    ProductAttribute = require('../models/m_product_attribute'),
    User = require('../models/m_user'),
    Schema = mongoose.Schema;

var ProductSchema = new Schema({
    pictures    : {
                    "type"      : "array",
                    "items"     : [ { "type": "String" } ],
                    "validate"  : [ minLengthValidation, '{PATH} must have at least 1 item' ]
                  },
    name        : {
                    "type"      : String,
                    "required"  : [true, 'Product name required'] 
                  },
    description : {
                    "type"      : String,
                    "default"   : "No description of the product" 
                  },
    categories  : {
                    "type"      : Array,
                    "items"     : { "type": Schema.Types.ObjectId },
                    "validate"  : [ minLengthValidation, '{PATH} must have at least 1 item' ]
                  },
    attributes  : [{ 
                    "type"      : Schema.ObjectId, 
                    "ref"       : 'Product_Attribute',
                    "validate"  : [ minLengthValidation, '{PATH} must have at least 1 item' ]
                  }],
    seller      : {
                    "type"      : Schema.ObjectId, 
                    "ref"       : 'User',
                    "required"  : [true, 'Seller username required'] 
                  },
    active      : {
                    "type"     : Boolean,
                    "default"  : true
                  },
    trending    : {
                    "type"     : Number,
                    "default"  : 0
                  },
    created     : { 
                    "type"      : Date, 
                    "default"   : Date.now 
                  }
});

function minLengthValidation(val) {
  return val.length >= 1 || val != null;
}

var product = mongoose.model('Product', ProductSchema);

module.exports = product;

// Producto
// {
//     pictures    : ['www.google.com', 'www.youtube.com'],
//     name        : 'Producto 1',
//     description : 'Descripción de prueba de producto 1',
//     categories  : [ ObjectId("580faff81ced8e9a25ddc3b6") ],
//     attributes  : [ ObjectId("580fb07d1ced8e9a25ddc3b7") ],
//     seller      : 'idramirezs10',
//     created     : new Date()
// }

// Category
// {
//     name : 'Categoria 1'
// }

