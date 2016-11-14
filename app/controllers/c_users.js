var UserModel  = require('../models/m_user'),
    Cart       = require('../models/m_cart'),
    config     = require('../../config/database'),
    jwt        = require('jsonwebtoken');

var signup = function(req, res) {
  if (!req.body.email || !req.body.username || !req.body.name || !req.body.password) {
    res.json({success: false, msg: 'Please input all required fields'});
  } else {
    var newUser = new UserModel({
      name      : req.body.name,
      lastname  : req.body.lastname,
      type      : req.body.type,
      email     : req.body.email,
      username  : req.body.username,
      password  : req.body.password
    });

    var cart = new Cart();
    cart.save(function(err) {
              if (err) {
                return res.json({success: false, msg: err});
              }
            });

    newUser.cart = cart._id;

    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: err});
      }
      res.status(200);
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
}

var authenticate = function(req, res) {
  UserModel.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          // var token = jwt.encode(user, config.secret);
          var token = jwt.sign({ _id : user._id }, config.secret, {
            expiresIn: 180000 // expires in 30 minutes
          });
          // return the information including token as JSON
          Cart.findOne({_id: user.cart}, function(err, cart){
            if(err){
                res.send({success: false, msg: err});      
            }
            else{
              res.status(200);
              res.json({success: true, token: token, cart: { _id: cart._id, size: cart.products.length } });
            }
          });

          
        } else {
          res.send({success: false, msg: 'Wrong password.'});
        }
      });
    }
  });
}

var userinfo = function(req, res) {
  var user = auth(req);
  if(user){
      UserModel.findOne({
        _id: user
      }, function(err, user) {
        if (err) throw err;    
        else {
          res.status(200);
          res.json({
                      name      : user.name,
                      lastname  : user.lastname,
                      username  : user.username,
                      type      : user.type,
                      birthday  : user.birthday
                  });
        }
      });       
  }
  else
  {
      res.send({success: false, msg: 'Something very bad happend'});
  }
}

var canIbe = function(req, res) {
      res.status(200);
      res.json({ success: true });
}

var auth = function(req) {
  var token = req.headers.authorization.split(' ')[1];
  var _doc;
  if (token) {
    try {
      _doc = jwt.verify(token, config.secret);
      return _doc._id;
    } 
    catch(err) {
      return _doc;
    }     
  } 
  else {
    // console.log("Todo mal 2");
    return _doc;
  }
};

module.exports = { signup, authenticate, userinfo, auth, canIbe };