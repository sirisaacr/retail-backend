var Router          = require('router'),
    ordersCtlr      = require('../controllers/c_orders'),
    passport        = require('passport');

var router = Router();

router
    .route('/addOrders')
    .post(passport.authenticate('jwt', { session: false}), ordersCtlr.addOrders);

router
    .route('/getUserOrders')
    .get(passport.authenticate('jwt', { session: false}), ordersCtlr.getUserOrders);

module.exports = router;