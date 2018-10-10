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
    }
  })
  lp_user.associate = function (models) {
    // associate project tasks
    models.lp_user.hasMany(models.lbs, {foreignKey: 'pm_id', sourceKey: 'id'});
  }

  return lp_user
}