module.exports = function (sequelize, Sequelize) {

  var cft = sequelize.define('cft', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.TEXT
    },
    real_team: {
      type: Sequelize.BOOLEAN
    }
  })
  cft.associate = function (models) {
   // associate project with MRR
   models.cft.hasMany(models.lp_project, { foreignKey: 'cft_id', sourceKey: 'id' });
}
  return cft
}