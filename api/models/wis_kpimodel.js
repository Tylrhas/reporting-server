//get env vars
require('dotenv').config();
//require express for use of exports
var express = require('express');
//connection for the database
const { Client } = require('pg')

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: true,
})

// use of models
exports.getCurrentQuarter = function (req, res) {
  //create object out of req and res 
  obj = {
    'res': res,
    'req':req
  }
  getKpiData(obj)
}

function getKpiData(obj){
  client.connect((err) => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected')
      client.query('SELECT * FROM lp_tasks',(err, querydata) => {
        if (err) throw err
        //add query data to the object 
        obj.querydata = querydata.rows[0]
        formatData(obj)
        client.end()
      })
    }
  })
}
function formatData(obj){
  console.log(obj)
  obj.res.json(obj.querydata);
}