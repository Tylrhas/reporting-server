module.exports = function (sequelize, Sequelize) {

  var cft = sequelize.define('cft', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.TEXT
    }
  })
  return cft
}