module.exports = function (sequelize, Sequelize) {

  var lp_project_priority = sequelize.define('lp_project_priority', {
      id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
      },
      project_id: {
        type: Sequelize.INTEGER
    },
      priority: {
          type: Sequelize.INTEGER
      },
      index: {
          type: Sequelize.INTEGER
      }
  })
  return lp_project_priority;
}