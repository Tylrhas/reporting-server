var Sequelize = require("sequelize")
const Op = Sequelize.Op
//Models
var db = require("../../models")
var moment = require('moment');
var teamMrr = require('../../lib/reports/team_mrr')
var cfts = require('../../lib/reports/cft')
var mrr = require('../../controllers/reportcontroller')

module.exports = function (app, passport) {
}