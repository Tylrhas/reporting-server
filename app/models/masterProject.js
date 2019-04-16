module.exports = function (sequelize, Sequelize) {

  var masterProject = sequelize.define('masterProject', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    pmId: {
      type: Sequelize.INTEGER
    },
    totalMrr: {
      type: Sequelize.REAL
    },
    grossPs: {
      type: Sequelize.REAL
    },
    netPs: {
      type: Sequelize.REAL
    },
    totalPsDiscount: {
      type: Sequelize.REAL
    },
    grossCs: {
      type: Sequelize.REAL
    },
    netCs: {
      type: Sequelize.REAL
    },
    totalCsDiscount: {
      type: Sequelize.REAL
    },
    opportunityCloseDate: {
      type: Sequelize.DATE
    }, 
    estimatedGoLive: {
      type: Sequelize.DATE
    },
    actualGoLive: {
      type: Sequelize.DATE
    },
    originalEstimatedGoLive: {
      type: Sequelize.DATE
    },
    websiteLaunchDate: {
      type: Sequelize.DATE
    },
    startDate: {
      type: Sequelize.DATE
    },
    lostDate: {
      type: Sequelize.DATE
    },
    stage: {
      type: Sequelize.TEXT
    },
    projectPhase: {
      type: Sequelize.TEXT
    },
    onHoldDate: {
      type: Sequelize.DATE
    }

  })
  masterProject.associate = function (models) {
      // associate project tasks
      models.masterProject.hasMany(models.lbs, {foreignKey: 'master_project_id', sourceKey: 'id'})
      models.masterProject.belongsTo(models.lp_user, {foreignKey: 'pmId', sourceKey: 'id'})
    }
    
  return masterProject

}