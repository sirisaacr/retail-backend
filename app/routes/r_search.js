var Router          = require('router'),
    ProductCtlr     = require('../controllers/c_products');

var router = Router();

router
    .route('/')
    .get(ProductCtlr.searchProducts);

module.exports = router;