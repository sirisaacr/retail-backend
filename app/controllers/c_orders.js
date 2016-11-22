var ObjectId         = require('mongoose').Types.ObjectId,
    Cart             = require('../models/m_cart'),
    Order            = require('../models/m_orders'),
    User             = require('../models/m_user'),
    authentication   = require('./c_users');

// This function is used to return the cart of the user when logs in
var getUserOrders = function(req, res){
    var user = authentication.auth(req);
    if(user)
    {
        Order.find({buyer: user})
            .exec(function(err, result){
                res.send({success: true, orders: result });
            });
    }
}

// This funtion creates an order from the items of a cart
var addOrders = function(req, res){
    var user = authentication.auth(req);
    if(user)
    {
        var orders = req.body.ordersToAdd;
        var newOrder = new Order({
            buyer       : ObjectId(user),
            products    : orders
        });


        newOrder.save(function(err, result){
            if(err){
                res.send({success: false, msg: err });
            }
            else{
                res.send({success: true, order: result });
            }
        });

        //remove the items from the cart
        var cart_id = req.body.cart_id;
        Cart.find({ "_id": ObjectId(cart_id) })
            .populate({
                    path: 'products',
                    populate: {
                                    path: 'attribute',
                                    select:'_id',
                                    match   : { 'active': true }
                              }
            })
            .exec(function(err, cart){
                var products = cart[0].products;
                var length = products.length;
                for(var i = 0; i < length; i++){
                    var product_id = products[0]._id;
                    cart[0].products.remove(product_id);
                }
                cart[0].save();
            });
    }
}

module.exports = { getUserOrders, addOrders };
