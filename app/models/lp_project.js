'use strict'
module.exports = function (sequelize, Sequelize) {

    var LpProject = sequelize.define('lp_project', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        cft_id: {
            type: Sequelize.INTEGER
        },
        client_id: {
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.TEXT,
        },
        // Dates
        done_on: {
            type: Sequelize.DATE,
        },
        started_on: {
            type: Sequelize.DATE,
        },
        expected_finish: {
            type: Sequelize.DATE,
        },
        expected_start: {
            type: Sequelize.DATE,
        },
        is_done: {
            type: Sequelize.BOOLEAN,
        },
        is_on_hold: {
            type: Sequelize.BOOLEAN,
        },
        is_archived: {
            type: Sequelize.BOOLEAN,
        },
        promise_by: {
            type: Sequelize.DATE,
        },
        // BEGIN CUSTOM FIELDS
        promo_project: {
            type: Sequelize.BOOLEAN
        },
        level_of_service: {
            type: Sequelize.TEXT
        },
        vertical: {
            type: Sequelize.TEXT,
        },
        package: {
            type: Sequelize.TEXT,
        },
        project_type: {
            type: Sequelize.TEXT,
        },
        ps_phase: {
            type: Sequelize.TEXT,
        },
        risk_level: {
            type: Sequelize.TEXT,
        },
        project_impact: {
            type: Sequelize.TEXT,
        },
        launch_type: {
            type: Sequelize.TEXT,
        },
        launch_day: {
            type: Sequelize.INTEGER,
        },
        launch_month: {
            type: Sequelize.TEXT,
        },
        copy: {
            type: Sequelize.TEXT,
        },
        design_initial_build: {
            type: Sequelize.TEXT,
        },
        custom_logo: {
            type: Sequelize.TEXT,
        },
        custom_copy_complete: {
            type: Sequelize.TEXT,
        },
        design_complete: {
            type: Sequelize.TEXT,
        },
        number_of_locations: {
          type: Sequelize.INTEGER,
      }
    })

    LpProject.associate = function (models) {
        // associate project with children
        models.lp_project.hasMany(models.treeitem, { foreignKey: 'project_id', sourceKey: 'id' });
        // associate project with MRR
        models.lp_project.hasMany(models.lbs, { foreignKey: 'project_id', sourceKey: 'id' });
    }

    return LpProject;
}