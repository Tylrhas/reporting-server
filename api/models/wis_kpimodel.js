//get env vars
require('dotenv').config();
//require express for use of exports
var express = require('express');
//connection for the database
const { Pool, Client } = require('pg')
// pools will use environment variables
// for connection information
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database:process.env.PGDATABASE ,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: true
})

// use of models
exports.getCurrentQuarter = function(req,res){
	//var query = buildQuery(req);
     runKPIQuery(req, res, returnData);
}

//functions for said models
function runKPIQuery(req,res,callback){
var data  = null;

  const query = {
  // give the query a unique name
  name: 'fetch-user',
  text: 'SELECT * FROM lp_tasks',
}

pool.query(query,(err, result) => {
  callback(req, res, err, result);
 })
}

function returnData(req, res, err, result){
   if (err) {
    console.log(err.stack)
  } else {
    console.log(result.rows[0])

    res.json(result.rows)
  }
}