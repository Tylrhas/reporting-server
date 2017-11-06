//get env vars
require('dotenv').config();

var exports = module.exports = {}

//add event emmitter 
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
//connection for the database
const { Pool, Client } = require('pg');

//global vars for easier use of callbacks
var pool;
var client;
//global var to send with for this file
var weightedResults;

exports.getPMWeightedData = function(req, res){
    //reset the query results
    weightedResults = [];
      createPool();
      getPMWeightedData(PmLocationQuery());

      //listen for the return results event
        myEmitter.once('returnresults', () => {
        return weightedResults
    })
}

function createPool() {
    pool = new Pool({
        user: process.env.localDbUSER,
        host: process.env.localDbHOST,
        database: process.env.localDbDATABASE,
        password: process.env.localDbPASSWORD,
        port: process.env.localDbPORT,
        ssl: true
    });
}

function PmLocationQuery() {
    var query = {
        // give the query a unique name
        name: "PMWeightedLocationCount",
        text: 'SELECT lpp.project_name AS "Project Name", lpp.owners AS "Owner", lpp.vertical AS "Vertical", lpp.package AS "Package", lpp.project_type AS "Project Type", lpp.ps_phase AS "PS Phase", pwl.location_count AS "Weighted Location Count" FROM lp_projects AS lpp JOIN pm_weighted_locations AS pwl ON lpp.id = pwl.project_id WHERE lpp.is_done IS FALSE;'
    }
    return query
}

function getPMWeightedData(query){
pool.connect((err, client, release) => {
        if (err) {
            updateStatus = {
                'Status': 'Failed',
                'Error': 'Error acquiring client' + err.stack
            }
            console.error('Error acquiring client', err.stack)
            myEmitter.emit('returnresults');
            return
        }
        client.query(query, (err, result) => {
            //release client back to the pool
            release();
            if (err) {
                updateStatus = {
                    'Status': 'Failed',
                    'Error': 'Error executing query' + err.stack
                }
                console.error('Error executing query', err.stack)
                myEmitter.emit('returnresults');
                return
            }
            calculateWeightedLocationCount(result);
      pool.end();
      console.log('pool has drained');
      return
    })
            //no errors return data
        })
}
function calculateWeightedLocationCount(result){
weightedResults = result
myEmitter.emit('returnresults');
}