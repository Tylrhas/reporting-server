module.exports = function (sequelize, Sequelize) {
  var lp_user = sequelize.define('lp_user', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },

    first_name: {
      type: Sequelize.STRING
    },

    last_name: {
      type: Sequelize.STRING
    },
    team: {
      type: Sequelize.ENUM('SEO', 'QC', 'PM', 'WIS', 'null'),
      defaultValue: 'null'
  }

  })

  return lp_user
}