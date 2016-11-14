var ObjectId         = require('mongoose').Types.ObjectId,
    ProductModel     = require('../models/m_product'),
    ProductAttribute = require('../models/m_product_attribute'),
    ProductCategory  = require('../models/m_categories'),
    cloudinarycfg    = require('../../config/cloudinary'),
    authentication   = require('./c_users'),
    jwt              = require('jsonwebtoken'),
    cloudinary       = require('cloudinary');

var getProducts = function(req, res) {
    if (req.query.item)
    {
      ProductModel
        .findOne({_id: new ObjectId(req.query.item)})
        .populate('attributes') // only works if we pushed refs to children
        .exec(function (err, products) {
                if (err){
                    res.json({success: false, msg: err});
                }
                else{
                    res.json({success: true, product: products});
                }

        });
    }
    else
    {
        ProductModel.find(function(err, data) {
            res.json({success: true, products: data});
        });
    }
}

var getCategories = function(req, res) {
    ProductCategory.find(function(err, data) {
        if(err){
            res.json({success: false, msg: err});
        }
        else{
            res.json({success: true, categories: data});
        }
    });
}

var getAttributes = function(req, res) {
    if (req.query.attribute)
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
        if(err){
            res.json({success: false, msg: "An error occured connecting to database"});
        }
        else{
            res.status(200);
            res.json({success: true, trending: data});
        }
    }
  );
}


var trendyProducts = function(req, res) {
    ProductModel
        .find({})
        .populate('attributes') // only works if we pushed refs to children
        .exec(function (err, products) {
                if (err){
                    res.json({success: false, msg: err});
                }
                else{
                    res.json({success: true, products: products});
                }
        });
                
}


var createProduct = function(req, res) {
    var user = authentication.auth(req);
    if(user)
    {
        var categories = objectifyIds(req.body.categories);
        var proms = uploadPictures(req.body.pictures);

        Promise.all(proms).then(
            function(val){
                var pictures = obtainURLS(val);
                var product = new ProductModel({    
                                                "name"        : req.body.name,
                                                "description" : req.body.description,
                                                "seller"      : user,
                                                "categories"  : categories,
                                                "pictures"    : pictures 
                                            });
                var attributes = req.body.attributes;

                for (var i = 0; i < attributes.length; i++) {
                    var attr = {
                        "price"     : attributes[i].price,
                        "discount"  : attributes[i].discount,
                        "stock"     : attributes[i].stock,
                        "state"     : attributes[i].state,
                        "color"     : attributes[i].color,
                        "style"     : attributes[i].style,
                        "size"      : attributes[i].size
                    }

                    var attribute = new ProductAttribute(attr);
                    attribute.save(function (err) {
                        if (err){
                            return res.json({success: false, msg: err});
                        } 
                    });
                    product.attributes.push(attribute._id);
                }
                product.save(function(err, createdProduct){
                    if (err){
                        return res.json({success: false, msg: err});
                    }
                    else{
                        res.json({success: true, createdProduct: createdProduct});
                    }
                });
        });
    }
    else{
        res.status(403);
        res.send({success: false, msg: 'Something very bad happend'});
    }   
}

var uploadPictures = function(array){
    cloudinary.config({ 
        cloud_name: cloudinarycfg.cloud_name, 
        api_key: cloudinarycfg.api_key, 
        api_secret: cloudinarycfg.api_secret 
    });        
    proms = []
    for (i = 0; i < array.length; i++) { 
        proms.push(cloudinary.v2.uploader.upload(array[i]));
    }
    console.log(proms);
    return proms;
}

var obtainURLS = function(array){
    var urls = []
    for (i = 0; i < array.length; i++) { 
        urls.push(array[i].secure_url);
    }
    return urls;
}

var objectifyIds = function(array){
    oIds = []
    for (i = 0; i < array.length; i++) { 
        oIds.push( new ObjectId( array[i] ) );
    }
    return oIds;
}

module.exports = { getProducts, searchProducts, createProduct, trendyProducts, getCategories };

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


