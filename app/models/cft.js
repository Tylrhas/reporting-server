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
  cft.associate = function (models) {
    console.log(models)
    // associate project tasks
    models.cft.hasMany(models.lp_project, { foreignKey: 'cft_id', sourceKey: 'id' });
}
  return cft
}