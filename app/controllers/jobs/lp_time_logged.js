//import required modules
require('dotenv').config();
const Sequelize = require('sequelize');
exports = module.exports = {};

// connect to the external database
const remoteDB = new Sequelize(process.env.remoteDB);

// get the time logged from the remote database and log it to the 

exports.update = function (){
//connect to remote db 
// get all data 
// upsert the data to the local db 
// if all sucessfull then clear the remote db
}