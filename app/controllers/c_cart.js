var ObjectId         = require('mongoose').Types.ObjectId,
    CartProduct      = require('../models/m_cart_product'),
    Cart             = require('../models/m_cart'),
    User             = require('../models/m_user'),
    authentication   = require('./c_users');


var getUserCart = function(req, res){
    var user = authentication.auth(req);
    if(user)
    {
        User.findOne({_id: user})
            .select('cart')
            .populate({
                path    : 'cart',
                populate: { 
                                path: 'products',
                                populate: [{
                                            path: 'attribute',
                                            select:'price discount state style color size'
                                          },
                                          {
                                            path: 'product',
                                            select:'name pictures'
                                          }
                                          ] 
                          }
            })
            .exec(function(err, result){

                res.send({success: true, cart: result.cart });
            });
    }
}

var getUserCartProduct = function(user, attribute_id){
    console.log(attribute_id);
    return new Promise(function(resolve, reject){
        User.findOne({_id: user})
        .select('cart')
        .populate({
            path    : 'cart',
            populate: { 
                        path: 'products',
                        populate: [{
                                        path: 'attribute',
                                        select:'price discount state style color size'
                                    },
                                    {
                                        path: 'product',
                                        select:'name pictures'
                                    }],
                         match   : { 'attribute': { $eq: ObjectId(attribute_id) } }
                        }
        })
        .exec(function(err, result){
            resolve(result.cart); 
        });
    });
}

var addProduct = function(req, res) {
    var user = authentication.auth(req);
    if(user)
    {
        var cart = req.body.cart;
        var product = req.body.product;
        Cart.findOne({ "_id": ObjectId(cart) })
            .populate({
                path    : 'products',
                match   : { 'attribute': { $eq: ObjectId(product.attribute) } }
            })
            .exec(function(err, result){
                if(!result.products.length){
                    var newCartProduct = new CartProduct(product);
                    newCartProduct.save();
                    Cart.findOne({ "_id": ObjectId(cart) },
                        function(err, cart){
                            cart.products.push(newCartProduct);
                            cart.save();

                            getUserCartProduct(user,newCartProduct.attribute)
                                    .then(function(val){
                                        res.send({success: true, updatedCartProduct: val.products[0] });
                                    });

                            
                        });
                }
                else{
                    CartProduct.findOne({"_id": result.products[0]._id},
                                function(err, c_product){
                                    c_product.quantity = c_product.quantity + product.quantity;
                                    c_product.save();
                                    getUserCartProduct(user,c_product.attribute)
                                        .then(function(val){
                                            res.send({success: true, updatedCartProduct: val.products[0] });
                                        });
                                });
                }
            });
                   
    }
    else{
        res.status(403);
        res.send({success: false, msg: 'Something very bad happend'});
    }       
}

module.exports = { addProduct, getUserCart };
