//pass i and row.length into functions and check if it is the last row row.length -1
require('dotenv').config()
var fs = require('fs')
var readline = require('readline')
var google = require('googleapis')
var googleAuth = require('google-auth-library')
const { Pool, Client } = require('pg')
//require express for use of exports
var express = require('express');
 
//add event emmitter 
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

//global vars for easier use of callbacks
var pool
var client
var updateStatus
var rowsWithId = []
var completedQueries = []

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

exports.getAlldata = function(req, res){
  myEmitter.once('QCUpdatesDone', () => {
        res.setHeader('Content-Type', 'application/json');
        res.json(updateStatus)
        console.log()
    })
  createPool();

  pool.connect((err, client, release) => {
    if (err) {
      updateStatus = {
        'Status': 'Failed',
        'Error': 'Error acquiring client' + err.stack
      }
      console.error('Error acquiring client', err.stack)
      myEmitter.emit('QCUpdatesDone');
      return
    }
    client.query('SELECT * from gd_qcscore', (err, result) => {
      //release client back to the pool
      release()
      if (err) {
        updateStatus = {
          'Status': 'Failed',
          'Error': 'Error executing query' + err.stack
        }
        console.error('Error executing query', err.stack)
        myEmitter.emit('QCUpdatesDone');
        return
      }
      updateStatus = result;

      myEmitter.emit('QCUpdatesDone');
})
})
}

exports.updateQCScoresNoAPI = function (req, res) {
  // Listen for the emmiter to say the updates are done
  myEmitter.once('QCUpdatesDone', () => {
    return updateStatus
  })
  // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      updateStatus = {
        'Status': 'Failed',
        'Error': 'Error loading client secret file: ' + err
      }
      console.log('Error loading client secret file: ' + err);
      myEmitter.emit('QCUpdatesDone');
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), getQcScoresSheet);
    //retrun the status of the update
  });
}

exports.updateQCScores = function (req, res) {
  // Listen for the emmiter to say the updates are done
  myEmitter.once('QCUpdatesDone', () => {
    //push an array of each number of queries done and then compare the two on event and see if they are the same
    res.setHeader('Content-Type', 'application/json');
    res.json(updateStatus)
  })
  // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      updateStatus = {
        'Status': 'Failed',
        'Error': 'Error loading client secret file: ' + err
      }
      console.log('Error loading client secret file: ' + err);
      myEmitter.emit('QCUpdatesDone');
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), getQcScoresSheet);
    //retrun the status of the update
  });
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        updateStatus = {
          'Status': 'Failed',
          'Error': 'Error while trying to retrieve access token ' + err
        }
        console.log('Error while trying to retrieve access token', err);
        myEmitter.emit('QCUpdatesDone');
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}


function getQcScoresSheet(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: process.env.spreadsheetId,
    range: process.env.googleSheetTabName + '!A:V',
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      updateStatus = {
        'Status': 'Failed',
        'Error': 'The API returned an error: ' + err
      }
      myEmitter.emit('QCUpdatesDone');
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      resetVars()
      //create connection pool
      createPool()
      createValueArray(rows)
      updateQCScores()

    }
  });
}
function resetVars(){
  //reset array to 0
  rowsWithId = []
  completedQueries = []
  pool =''
  client =''
  updateStatus = ''
}
function createValueArray(rows) {
  //iterate through rows and log or update data
  for (var i = 4; i < rows.length; i++) {
    var row = rows[i];
    //make sure the row has an ID
    if (row[0] !== "") {
      rowsWithId.push(row)
      console.log(row[0])
    }
  }
}

function updateQCScores() {
  console.log(rowsWithId.length)
  for (var i = 0; i < rowsWithId.length; i++) {
    var row = rowsWithId[i];

    checkForData(checkForIdQuery(row[0]), row, i)
  }
}
function createPool() {
  pool = new Pool({
    user: process.env.localDbUSER,
    host: process.env.localDbHOST,
    database: process.env.localDbDATABASE,
    password: process.env.localDbPASSWORD,
    port: process.env.localDbPORT,
    ssl: true
  })
}
function checkForData(query, row, i) {
  pool.connect((err, client, release) => {
    if (err) {
      updateStatus = {
        'Status': 'Failed',
        'Error': 'Error acquiring client' + err.stack
      }
      console.error('Error acquiring client', err.stack)
      myEmitter.emit('QCUpdatesDone');
      return
    }
    client.query(query, (err, result) => {
      //release client back to the pool
      release()
      if (err) {
        updateStatus = {
          'Status': 'Failed',
          'Error': 'Error executing query' + err.stack
        }
        console.error('Error executing query', err.stack)
        myEmitter.emit('QCUpdatesDone');
        return
      }
      //if data doesnt exist then add it
      if (Object.keys(result.rows).length === 0) {
        //addQCData()
        console.log('adding data')
        sqlQueryQcScore(addQCDataQuery(row), client, release, i)
      }
      else {
        sqlQueryQcScore(updateQCDataQuery(row), client, release, i)
      }
      //GetGoogleSheetData
    })
  })
}
function checkForIdQuery(NsId) {
  var query = {
    // give the query a unique name
    name: 'checkForExistingData',
    text: 'SELECT * FROM gd_qcscore where id= $1::int',
    values: [NsId]
  }
  return query
}
function sqlQueryQcScore(query, client, release, i) {
  client.query(query, (err, result) => {
    //release client back to the pool
    release()
    if (err) {
      updateStatus = {
        'Status': 'Failed',
        'Error': 'Error executing query' + err.stack
      }
      myEmitter.emit('QCUpdatesDone');
      console.error('Error executing query', err.stack)
      return
    }
    console.log('i= ' + i + 'length of array= ' + rowsWithId.length)
    //push the completed query into array
    completedQueries.push(rowsWithId[i])
    console.log(completedQueries.length+' '+rowsWithId.length)
    //check if the completed queries and the queries array are the same length
    if (completedQueries.length === rowsWithId.length) {
      updateStatus = {
        'Status': 'Sucess',
        'Message': 'QC Scores Have Been Updated'
      }
      console.log('QCUpdatesDone')
      pool.end()
      console.log('pool has drained')
      myEmitter.emit('QCUpdatesDone')
      return
    }
  })
}
function addQCDataQuery(row) {
  var query = {
    // give the query a unique name
    name: 'addQCData',
    text: 'INSERT INTO gd_qcscore (id, projectmanager, wcs, staging, prelive, live) VALUES($1::int, $2::text, $3::text, $4::int, $5::int, $6::int) RETURNING *',
    values: [row[0], row[4], row[6], row[7], row[7], row[9]]
  }
  return query
}
function updateQCDataQuery(row) {
  var query = {
    // give the query a unique name
    name: 'updateQCData',
    text: 'UPDATE gd_qcscore SET projectmanager = $2, wcs = $3, staging = $4, prelive = $5, live = $6  WHERE ID = $1::int',
    values: [row[0], row[4], row[6], row[7], row[7], row[9]]
  }
  return query
}