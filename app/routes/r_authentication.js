var Router          = require('router'),
    UserCtlr        = require('../controllers/c_users'),
    passport        = require('passport');

var router = Router();

router
    .route('/signup')
    .post(UserCtlr.signup);

router
    .route('/authenticate')
    .post(UserCtlr.authenticate);

router
    .route('/userinfo')
    .get(passport.authenticate('jwt', { session: false}), UserCtlr.userinfo);

router
    .route('/canIbe')
    .get(passport.authenticate('jwt', { session: false}), UserCtlr.canIbe);

module.exports = router;