'use strict'
module.exports = function (sequelize, Sequelize) {

    var LpProject = sequelize.define('lp_project', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        project_name: {
            type: Sequelize.TEXT,
            notEmpty: true
        },
        done_on: {
            type: Sequelize.DATE,
        },
        started_on: {
            type: Sequelize.DATE,
        },
        earliest_finish: {
            type: Sequelize.DATE,
        },
        earliest_start: {
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
        launch_day: {
            type: Sequelize.INTEGER,
        },
        launch_month: {
            type: Sequelize.TEXT,
        },
        project_impact: {
            type: Sequelize.TEXT,
        },
        launch_type: {
            type: Sequelize.TEXT,
        },
        project_type: {
            type: Sequelize.TEXT,
        },
        package: {
            type: Sequelize.TEXT,
        },
        services_activated: {
            type: Sequelize.BOOLEAN,
        },
        risk_level: {
            type: Sequelize.TEXT,
        },
        ps_phase: {
            type: Sequelize.TEXT,
        },
        vertical: {
            type: Sequelize.TEXT,
        },
        mrr: {
            type: Sequelize.DECIMAL
        },
        otr_ps: {
            type: Sequelize.DECIMAL
        },
        otr_cs: {
            type: Sequelize.DECIMAL
        },
        integration_type: {
            type: Sequelize.TEXT,
        },
        client_id: {
            type: Sequelize.INTEGER,
        }
    });

    LpProject.associate = function (models) {
        // associate project tasks
        models.lp_project.hasMany(models.lp_task, { foreignKey: 'project_id', sourceKey: 'id' });
        // associate project with priority
        models.lp_project.hasMany(models.lp_project_priority, { foreignKey: 'project_id', sourceKey: 'id' });
    };

    return LpProject;

}