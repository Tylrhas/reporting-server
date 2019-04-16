'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('lbs', 'projectPhase', {
          type: Sequelize.TEXT
        }, { transaction: t }),
        queryInterface.addColumn('lbs', 'projectLossReason', {
          type: Sequelize.TEXT,
        }, { transaction: t }),
        queryInterface.addColumn('lbs', 'estimatedLostDate', {
          type: Sequelize.DATE,
        }, { transaction: t })
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('lbs', 'projectPhase', { transaction: t }),
        queryInterface.removeColumn('lbs', 'projectLossReason', { transaction: t }),
        queryInterface.removeColumn('lbs', 'estimatedLostDate', { transaction: t })
      ])
    })
  }
}
