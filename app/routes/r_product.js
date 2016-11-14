var Router          = require('router'),
    ProductCtlr     = require('../controllers/c_products');
    passport        = require('passport');

var router = Router();

router
    .route('/')
    .get(ProductCtlr.getProducts);

router
    .route('/categories')
    .get(ProductCtlr.getCategories);

router
    .route('/trendy')
    .get(ProductCtlr.trendyProducts);

router
    .route('/')
    .post(passport.authenticate('jwt', { session: false}), ProductCtlr.createProduct);



module.exports = router;
