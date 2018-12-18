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

  app.use(bodyParser.json({limit: '50mb'}))
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 100000}))


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
var routes = require('./app/routes/index')(app,passport,express);


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