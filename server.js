var express = require('express')
var app = express()
var passport = require('passport')
var session = require('express-session')
var bodyParser = require('body-parser')
var env = require('dotenv').load()
var path = require('path')
var favicon = require('serve-favicon')
require('dotenv').config();
app.set('views', './app/views');
app.set('view engine', 'ejs');


//For BodyParser
// app.use(bodyParser.urlencoded({
//     extended: true,
//     limit: '50mb'
// }));
// app.use(bodyParser.json());

app.use(bodyParser({
        extended: true,
        limit: '2mb',
        parameterLimit: 10000
    }));


// For Passport
app.use(session({
    secret: process.env.session_secret,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))


//Models
var models = require("./app/models");

//Routes
var authRoute = require('./app/routes/auth.js')(app,passport);
var adminRoute = require('./app/routes/admin.js')(app,passport);
var apiRoute = require('./app/routes/api.js')(app,passport);
var pages = require('./app/routes/pages.js')(app,passport);
var webhooks = require('./app/routes/lp_webhooks.js')(app,passport);


//load passport strategies
require('./app/config/passport.js')(passport, models.user);

//load the jobs 
require('./app/config/job_scheduler');



//Sync Database

models.sequelize.sync().then(function () {

    console.log('Nice! Database looks fine')


}).catch(function (err) {

    console.log(err, "Something went wrong with the Database Update!")

});


app.listen(app.get('port'), function() {
    console.log('Reporting Server is running on port', app.get('port'))
  });