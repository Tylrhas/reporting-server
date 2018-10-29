module.exports = {
  getall,
  getName
}
var db = require('../../models')
var Sequelize = require("sequelize")
const Op = Sequelize.Op

function getall () {
  return db.cft.findAll()
}
function getName(cft_id) {
  return db.cft.findAll({
    where: {
      id: cft_id
    }
  })
}