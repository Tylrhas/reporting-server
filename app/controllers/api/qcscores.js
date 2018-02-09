var exports = module.exports = {}
require('dotenv').config();
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

//Models
var db = require("../../models");
// var qcScoreModel = db.qcscore;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com.json';

//add event emmitter 
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { };
const myEmitter = new MyEmitter();

exports.updateScores = function () {

    fs.readFile('./app/config/client_secret.json', function processClientSecrets(err, content) {
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
    console.log(db);
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
            //data is found here
            for (var i = 4; i < rows.length; i++) {
                row = rows[i];
                if (row[0] !== "") {
                    console.log(row);
                    db.qcScore.upsert({ id: row[0], projectmanager: row[4], wis: row[6], staging: row[7], prelive: row[8], live: row[9] }).then(results => {
                        //console.log(results);
                    })
                }
            }
        }
    });
}