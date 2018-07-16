module.exports = function (sequelize, Sequelize) {

  var lbs = sequelize.define('lbs', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    location_name: {
      type: Sequelize.TEXT
    },
    task_id: {
      type: Sequelize.INTEGER
    },
    total_mrr: {
      type: Sequelize.REAL
    },
    gross_ps: {
      type: Sequelize.REAL
    },
    net_ps: {
      type: Sequelize.REAL
    },
    total_ps_discount: {
      type: Sequelize.REAL
    },
    gross_cs: {
      type: Sequelize.REAL
    },
    net_cs: {
      type: Sequelize.REAL
    },
    total_cs_discount: {
      type: Sequelize.REAL
    },
    opportunity_close_date: {
      type: Sequelize.DATE
    }
  },
    {
      //use a sinular table name
      freezeTableName: true,
    })
    lbs.associate = function (models) {
      // associate project tasks
      models.lbs.belongsTo(models.treeitem, {foreignKey: 'task_id', sourceKey: 'id'});
    }
  return lbs

}