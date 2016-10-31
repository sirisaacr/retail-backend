var express         = require('express'),
    mongoose        = require('mongoose'),
    bodyParser      = require('body-parser'),
    r_product       = require('./app/routes/r_product'),
    r_search        = require('./app/routes/r_search'),
    r_authenticate  = require('./app/routes/r_authentication'),

    morgan          = require('morgan'),
    passport	    = require('passport'),
    config          = require('./config/database'), // get db config file
    // social          = require('./config/socialauth'), // get db config file
    User            = require('./app/models/m_user'), // get the mongoose model
    port            = process.env.PORT || 3000;

var app = express();

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());
require('./config/passport')(passport);

// app.get('/', function (req, res) {
// 	res.send('Hello Worldsasda!');
// });

app.use(bodyParser.json());

app.listen(port, '172.31.17.34', function(err) {
	if(err) throw err;
});

mongoose.connect(config.database, function(err) {
	if(err) throw err;
	console.log("Server started on port 3000");
});

app.use(function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 next();
});

app.use('/products', r_product);
app.use('/search', r_search);
app.use('/user', r_authenticate);