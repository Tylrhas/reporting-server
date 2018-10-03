module.exports = function (sequelize, Sequelize) {

    var pm = sequelize.define('pm', {
  
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      last_name: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    })
    pm.associate = function (models) {
        // associate project tasks
        models.pm.hasMany(models.lbs, {foreignKey: 'pm_id', sourceKey: 'id'});
      }
    return pm
  }