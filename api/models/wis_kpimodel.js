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
  console.log(req.params.name)
  if (req.params.name){
    var query =  createQuery(req)

    console.log(query)
    //name was specified
    getKpiData(req, res, query)
  }
  else{
    res.json("Please Select a WIS Name")
  }
}

function getKpiData(req, res, query){
  client.connect((err) => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected')
      client.query(query,(err, querydata) => {
        if (err) throw err
        //add query data to the object 
        res.json(formatData(querydata.rows[0]))
        client.end()
      })
    }
  })
}

function formatData(obj){
  console.log(obj)
  return obj
}
function createQuery(req){

  var daterange  = getQurterDateRange(req);
  var query = {
    // give the query a unique name
    name: 'fetch-wisKPI',
    text: 'select * from lp_tasks where owners = $1::text AND datedone BETWEEN $2::date AND $3::date',
    values: [req.params.name, daterange.begining , daterange.ending]
  }
  return query
}

function getQurterDateRange(req){
  var quarter = req.query.quarter
  var year = req.query.year 
  var dates =  {
    "begining":'',
    "ending":''
}
  if(quarter == 'q1'){
    dates.begining = year + '-01-01'
    dates.ending = year + '-03-31'
  }
  else if(quarter == 'q2'){
    dates.begining = year + '-04-01'
    dates.ending = year + '-06-30'
  }
  else if (quarter = 'q3'){
    dates.begining = year + '-07-01'
    dates.ending = year + '-09-30'
  }
  else{
    dates.begining = year + '-10-01'
    dates.ending = year + '-12-31'
  } 
  return dates
}