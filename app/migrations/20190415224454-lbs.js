'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    let masterProjectSchema = {
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
      projectLostReason: {
        type: Sequelize.TEXT
      },
      onHoldDate: {
        type: Sequelize.DATE
      }
    }
    return queryInterface.createTable('masterProjects', masterProjectSchema).then(() => {
      console.log('table Created')
      queryInterface.sequelize.query('SELECT DISTINCT master_project_id FROM lbs WHERE master_project_id is not null').then(projects => {
        projects = projects[0]
        let bulkInsertData = []
        for (let i = 0; i < projects.length; i++) {
          bulkInsertData.push({ id: projects[i].master_project_id })
        }
        console.log(bulkInsertData)
        return queryInterface.bulkInsert('masterProjects', bulkInsertData).then(() => {
          console.log('data Inserted')
          return
        })
      })
    })
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
   return queryInterface.dropTable('masterProjects')
  }
};
