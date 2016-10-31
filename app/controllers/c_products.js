var ObjectId         = require('mongoose').Types.ObjectId,
    ProductModel     = require('../models/m_product'),
    ProductAttribute = require('../models/m_product_attribute'),
    config           = require('../../config/database'),
    authentication   = require('./c_users'),
    jwt              = require('jsonwebtoken');

var getProducts = function(req, res) {
    if (req.query.item)
    {
      ProductModel.find(
        {
            _id: new ObjectId(req.query.item)
        },
        function(err, data) {
          res.send(data);
        }
      );
    }
    else
    {
      ProductModel.find(function(err, data) {
        res.send(data);
      });
    }
}

// This method searchs on product by 
var searchProducts = function(req, res) {
  var searchType = 0;
  var searchConditions = {};
  // 01 = search
  // 10 = category
  // 11 = search + category
  if (req.query.search){
    searchType += 1;
  }
  if (req.query.category)
  {
    searchType += 2;
  }

  switch(searchType) {
      case 1:
          searchConditions = { $or:[ {"name" : new RegExp(req.query.search, "i") }, 
                                     {'description' : new RegExp(req.query.search, "i") } ] };
          break;
      case 2:
          searchConditions = { categories: { $in: [ new ObjectId(req.query.category) ] } };
          break;
      case 3:
           searchConditions = { $and : [
                                    {$or:[ {"name" : new RegExp(req.query.search, "i") }, 
                                      {'description' : new RegExp(req.query.search, "i") } ]},
                                    { categories: { $in: [ new ObjectId(req.query.category) ] } }
                                ]
                              };
            break;
  }
  ProductModel.find(
    searchConditions,
    function(err, data) {
      res.send(data);
    }
  );
}

var createProduct = function(req, res) {
    var user = authentication.auth(req);
    if(user)
    {
        var attributes = req.body.attributes;
        var categories = objectifyIds(req.body.categories);
        
        ProductAttribute.create(attributes, function (err, savedAttributes) { 
            if (err) return console.log(err);
            
            var attributes = extractIds(savedAttributes);
            var product = {
                "name"        : req.body.name,
                "description" : req.body.description,
                "seller"      : user.username,
                "attributes"  : attributes,
                "categories"  : categories,
                "pictures"    : req.body.pictures
            }
            ProductModel.create(product, function(err, createdProduct){
                if (err){
                    res.status(403);
                }
                else{
                    res.status(200);
                    res.json(createdProduct);
                }
            });

        });
    }
    else{
      res.status(403);
      res.send({success: false, msg: 'Something very bad happend'});
    }
}

var extractIds = function(array){
    ids = []
    for (i = 0; i < array.length; i++) { 
        ids.push(array[i]._id);
    }
    return ids;
}

var objectifyIds = function(array){
    oIds = []
    for (i = 0; i < array.length; i++) { 
        oIds.push( new ObjectId( array[i] ) );
    }
    return oIds;
}

module.exports = { getProducts, searchProducts, createProduct };

// db.products.find({ $or:[ {"name" : new RegExp('producto', "i") }, 
//                          {'description' : new RegExp('producto', "i") } ]} )

// {
//     "name": "Item 3",
//     "description": "Descripción de prueba del numero 3",
//     "seller": "idramirezs10",
//     "created": new Date(),
//     "attributes": [
//       "580fb07d1ced8e9a25ddc3b7"
//     ],
//     "categories": [
//       "580faff81ced8e9a25ddc3b6"
//     ],
//     "pictures": [
//       "www.google.com",
//       "www.youtube.com"
//     ]
//   }

// db.products.find(
//       { $and : [
//             {$or:[ {"name" : new RegExp('producto', "i") }, 
//               {'description' : new RegExp('producto', "i") } 
//             ]},
//             { categories: { $in: [ObjectId("580faff81ced8e9a25ddc3b6")] } }
//         ]
//       })

























