// capture date
// pod ID
// number of projects 
// number of locations
// duration 1 ( imp start to stg del) within the last 30 days if phased project it is the last stg links del
// duration 2 ( imp start to website(s) live) within the last 30 days if phased project it is the last website(s) live

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
    number_of_locations: {
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