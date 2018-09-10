module.exports = {
  getall
}
var db = require('../../models')
var Sequelize = require("sequelize")
const Op = Sequelize.Op

function getall () {
  return db.cft.findAll()
}