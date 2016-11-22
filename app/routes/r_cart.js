var Router          = require('router'),
    cartCtlr        = require('../controllers/c_cart'),
    passport        = require('passport');

var router = Router();

router
    .route('/addToCart')
    .post(passport.authenticate('jwt', { session: false}), cartCtlr.addProduct);

router
    .route('/removeFromCart')
    .post(passport.authenticate('jwt', { session: false}), cartCtlr.removeProduct);


router
    .route('/getUserCart')
    .get(passport.authenticate('jwt', { session: false}), cartCtlr.getUserCart);

// router
//     .route('/removeProduct')
//     .post(passport.authenticate('jwt', { session: false}), cartCtlr.signup);

// router
//     .route('/deleteProduct')
//     .post(passport.authenticate('jwt', { session: false}), cartCtlr.signup);

// router
//     .route('/buyCart')
//     .post(passport.authenticate('jwt', { session: false}), cartCtlr.authenticate);


module.exports = router;