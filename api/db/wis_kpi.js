//get env vars
require('dotenv').config();
//require express for use of exports
var express = require('express');
//connection for the database
const { Pool, Client } = require('pg')

//set global vars for use in the functions
var pool = {}
var results = {}
var queries = {}
var response = ''

//KPI Exports

exports.quarterKpiNoName = function (req, res) {
  res.json({ "status": "Failed", "error": "Please Include a WIS Name" })
}

exports.wisQuarterKpi = function (req, res) {
  //set res as a global var
  getKPIData(res,req)
}

//Begin functions that get and format KPI data
function createPool() {
  pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: true
  })
}
function getKPIData(response,req) {
  //add the queries that need to be done
  queries.buildtime = false
  //queries.QCScore = false
  //queries.locationCount = false
  createPool()
  KpiQuery(response,createBuildTimeQuery(req))
}
function KpiQuery(response,query) {
  pool.query(query, (err, res) => {
    //console.log(err, res)
    //add the results to the results object
    results[query.name] = res.rows
    //add that the query is done to the queries object 
    queries[query.name] = true
    formatdata(response, query.name, res.rows)
    console.log(results)
    pool.end()
  })
}
function createBuildTimeQuery(req) {
  var daterange = getQurterDateRange(req);
  var query = {
    // give the query a unique name
    name: 'buildTime',
    text: 'select * from lp_tasks where owners = $1::text AND datedone BETWEEN $2::date AND $3::date',
    values: [req.params.name, daterange.begining, daterange.ending]
  }
  return query
}
function getQurterDateRange(req) {
  var quarter = req.query.quarter
  var year = req.query.year
  var dates = {
    "begining": '',
    "ending": ''
  }
  if (quarter == 'q1') {
    dates.begining = year + '-01-01'
    dates.ending = year + '-03-31'
  }
  else if (quarter == 'q2') {
    dates.begining = year + '-04-01'
    dates.ending = year + '-06-30'
  }
  else if (quarter = 'q3') {
    dates.begining = year + '-07-01'
    dates.ending = year + '-09-30'
  }
  else {
    dates.begining = year + '-10-01'
    dates.ending = year + '-12-31'
  }
  return dates
}
function formatdata(response, name, queryResults) {
  if (name == 'buildTime') {
    calculateBuildTime(response, name, queryResults)
  }
}
function checkSend(response, name, queryResults){
//make sure all of the queries are done before the JSON results are sent
response.json(queryResults)
}
function calculateBuildTime(response, name, queryResults){
  //calculate the build time and then add it to the results objects
  checkSend(response, name, queryResults)
}