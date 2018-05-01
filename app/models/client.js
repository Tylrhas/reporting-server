'use strict'
module.exports = function (sequelize, Sequelize) {

    var lp_client = sequelize.define('lp_client', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name: {
            type: Sequelize.TEXT,
        },
        client_type: {
          type: Sequelize.TEXT,
      },
    });

    lp_client.associate = function (models) {
        // associate project tasks
        models.lp_client.hasMany(models.lp_project, { foreignKey: 'client_id', sourceKey: 'id' });
    };

    return lp_client;

}