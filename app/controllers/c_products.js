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
        .populate({
                    path    : 'attributes',
                    select  : 'price discount state style color size active stock',
                    match   : { 'active': { $eq: true } }
                })
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
  ProductModel.find(searchConditions)
                .populate({
                        path    : 'attributes',
                        select  : 'price discount state style color size active stock',
                        match   : { 'active': { $eq: true } }
                    })
                .exec(function (err, products) {
                        if (err){
                            res.json({success: false, msg: err});
                        }
                        else{
                            res.json({success: true, products: products});
                        }
                });
}


var trendyProducts = function(req, res) {
    ProductModel
        .find({})
        .populate({
                    path    : 'attributes',
                    select:'price discount state style color size active stock',
                    match   : { 'active': { $eq: true } }
                 })
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
                                                "seller"      : new ObjectId(user),
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

var updateProduct = function(req, res) {
    var user = authentication.auth(req);
    if(user)
    {
        var categories = objectifyIds(req.body.categories);
        var proms = uploadPictures(req.body.pictures);
        var product_id = req.body._id;

        Promise.all(proms).then(
            function(val){

                // Obtener el producto
                // Reasignar las imagenes
                // Reasignar las categorias
                // Recorrer los attributos y actualizar los que vengan y borrar los q no vienen

                var incomingAttributes = req.body.attributes;

                for(var i = 0; i < incomingAttributes.length; i++){
                    var attribute = incomingAttributes[i];
                    if(attribute._id != ''){
                        // update it
                        ProductAttribute.findOne({_id: attribute._id},
                                    function(err, foundattribute){
                                            var index = indexOf(foundattribute._id, incomingAttributes);
                                            foundattribute.price = incomingAttributes[index].price;
                                            foundattribute.discount = incomingAttributes[index].discount;
                                            foundattribute.stock = incomingAttributes[index].stock;
                                            foundattribute.state = incomingAttributes[index].state;
                                            foundattribute.color = incomingAttributes[index].color;
                                            foundattribute.style = incomingAttributes[index].style;
                                            foundattribute.size = incomingAttributes[index].size;
                                            foundattribute.active = incomingAttributes[index].active;

                                            foundattribute.save();
                                        });
                    }
                }

                ProductModel.findOne({_id: product_id})
                            .populate('attributes')
                            .exec(function(err, product){

                                product.name = req.body.name;
                                product.description = req.body.description;
                                product.categories = categories;
                                var pictures = obtainURLS(val);
                                product.pictures = pictures;

                                for(var i = 0; i < incomingAttributes.length; i++){
                                    var attribute = incomingAttributes[i];
                                    if(attribute._id == ''){
                                        var attr = {
                                            "price"     : attribute.price,
                                            "discount"  : attribute.discount,
                                            "stock"     : attribute.stock,
                                            "state"     : attribute.state,
                                            "color"     : attribute.color,
                                            "style"     : attribute.style,
                                            "size"      : attribute.size
                                        }

                                        var attribute = new ProductAttribute(attr);
                                        attribute.save(function (err) {
                                            if (err){
                                                return res.json({success: false, msg: err});
                                            } 
                                        });
                                        product.attributes.push(attribute._id);
                                    }
                                }

                                product.save(function(err, updatedProduct){
                                    if (err){
                                        return res.json({success: false, msg: err});
                                    }
                                    else{
                                        console.log(updatedProduct);
                                        res.json({success: true, updatedProduct: updatedProduct});
                                    }
                                });

                            }); // .exec    
        });// Promise.then
    }
    else{
        res.status(403);
        res.send({success: false, msg: 'Something very bad happend'});
    }   
}

var indexOf = function(element_id, array){
    for (i = 0; i < array.length; i++) {
        var index_element = array[i]; 
        if(element_id == index_element._id){
            return i;
        }
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

var getMyProducts = function(req, res){
    var user = authentication.auth(req);
    if(user)
    {
        ProductModel
            .find({ seller: new ObjectId(user) })
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
}


module.exports = { getProducts, searchProducts, createProduct, trendyProducts, getCategories, 
                    getMyProducts, updateProduct };