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
    project_id: {
      type: Sequelize.INTEGER
    },
    master_project_id: {
      type: Sequelize.INTEGER
    },
    pm_id: {
      type: Sequelize.INTEGER
    },
    project_type: {
      type: Sequelize.TEXT
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
    }, 
    estimated_go_live: {
      type: Sequelize.DATE
    },
    actual_go_live: {
      type: Sequelize.DATE
    },
    original_estimated_go_live: {
      type: Sequelize.DATE
    },
    website_launch_date: {
      type: Sequelize.DATE
    },
    start_date: {
      type: Sequelize.DATE
    },
    project_lost_date: {
      type: Sequelize.DATE
    },
    stage: {
      type: Sequelize.TEXT
    }
  },
    {
      //use a sinular table name
      freezeTableName: true,
    })
    lbs.associate = function (models) {
      // associate project tasks
      models.lbs.belongsTo(models.treeitem, {foreignKey: 'task_id', sourceKey: 'id'});
      models.lbs.belongsTo(models.lp_user, {foreignKey: 'pm_id', sourceKey: 'id'});
    }
  return lbs

}