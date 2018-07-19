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
        services_activated: {
            type: Sequelize.BOOLEAN,
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
        }
    })

    LpProject.associate = function (models) {
        // associate project with children
        models.lp_project.hasMany(models.treeitem, { foreignKey: 'id', sourceKey: 'id' });
    }

    return LpProject;
}