// capture date
// pod ID
// number of projects 
// number of locations
// duration 1 ( imp start to stg del)
// duration 2 ( imp start to website(s) live)

module.exports = function (sequelize, Sequelize) {

  var scheduledImp = sequelize.define('scheduledImp', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    cft_id: {
      type: Sequelize.INTEGER
    },
    captureDate: {
      type: Sequelize.TEXT
    },
    projectCount: {
      type: Sequelize.REAL
    },
    locationCount: {
      type: Sequelize.REAL
    },
    duration1: {
      type: Sequelize.REAL
    },
    duration2: {
      type: Sequelize.REAL
    }
  })
  return scheduledImp
}