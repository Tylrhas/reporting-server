module.exports = function (sequelize, Sequelize) {

  var lp_folder = sequelize.define('lp_folder', {
      id: {
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
      },
      lp_folder_name: {
          type: Sequelize.TEXT
      },
      is_done: {
          type: Sequelize.BOOLEAN
      },
      index: {
          type: Sequelize.INTEGER
      },
      date_done: {
        type: Sequelize.DATE
      },
      project_id: {
        type: Sequelize.INTEGER
      }
      
      
  });
  lp_folder.associate = function (models) {
    // associate project tasks
    models.lp_folder.hasMany(models.lp_task, { foreignKey: 'parent_id', sourceKey: 'id' });
};
  return lp_folder;
}