//get env vars
require('dotenv').config();

//the Guts of the API
const {Pool,Client} = require('pg');
var parse = require('pg-connection-string').parse;
var express = require('express');

const connectionString = process.env.DATABASE_URL;

exports.getCurrentQuarter = function(req){
	//var query = buildQuery(req);
    return 'working';

}