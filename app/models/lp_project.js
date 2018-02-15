module.exports = function (sequelize, Sequelize) {

    var LpProject = sequelize.define('lp_project', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        is_done: {
            type: Sequelize.BOOLEAN,
            notEmpty: true
        },

        updated_on: {
            type: Sequelize.DATE,
            notEmpty: true
        },

        pcost: {
            type: Sequelize.DECIMAL
        },

        otr_cs: {
            type: Sequelize.DECIMAL,
        },

        project_name: {
            type: Sequelize.TEXT,
            allowNull: false
        },

        client_name: {
            type: Sequelize.TEXT
        },

        owners: {
            type: Sequelize.TEXT
        },
        vertical: {
            type: Sequelize.TEXT
        },
        package: {
            type: Sequelize.TEXT
        },
        mrr: {
            type: Sequelize.DECIMAL
        },
        client_type: {
            type: Sequelize.TEXT
        },
        project_type: {
            type: Sequelize.TEXT
        },
        launch_type: {
            type: Sequelize.TEXT
        },
        platform_type: {
            type: Sequelize.TEXT
        },
        integration_type: {
            type: Sequelize.TEXT
        },
        ps_phase: {
            type: Sequelize.TEXT
        },
        risk_level:{
            type: Sequelize.TEXT
        },
        project_impact:{
            type: Sequelize.TEXT
        },
        services_activated:{
            type: Sequelize.BOOLEAN,
            notEmpty: false
        },
        otr_ps: {
            type: Sequelize.DECIMAL
        },

    });

    return LpProject;

}