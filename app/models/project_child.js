module.exports = function (sequelize, Sequelize) {
  var treeitem = sequelize.define('treeitem', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.TEXT,
      notEmpty: true
    },
    parent_id: {
      type: Sequelize.INTEGER,
      hierarchy: true
    },
    child_type: {
      type: Sequelize.ENUM('folder', 'milestone','task', 'project'),
      defaultValue: 'folder'
    },
    // Dates
    e_start: {
      type: Sequelize.DATE,
      allowNull: true
    },
    e_finish: {
      type: Sequelize.DATE
    },
    deadline: {
      type: Sequelize.DATE
    },
    ready_on: {
      type: Sequelize.DATE
    },
    started_on: {
      type: Sequelize.DATE
    },
    is_done: {
      type: Sequelize.BOOLEAN
    },
    date_done: {
      type: Sequelize.DATE
    },
    hrs_logged: {
      type: Sequelize.REAL
    },
    hrs_remaning: {
      type: Sequelize.REAL
    },
    // Custom Fields
    task_type: {
      type: Sequelize.TEXT,
    },
    milestone_type: {
      type: Sequelize.TEXT,
      notEmpty: true
    },
    cs_offering: {
      type: Sequelize.TEXT,
    },
    billing_type: {
      type: Sequelize.DATE,
    },
    billing_lost_reason: {
      type: Sequelize.TEXT,
    },
    website_type: {
      type: Sequelize.TEXT,
    },
    design_type: {
      type: Sequelize.TEXT,
    }},
    {
      //use a sinular table name
      freezeTableName: true,
    })
  return treeitem
}