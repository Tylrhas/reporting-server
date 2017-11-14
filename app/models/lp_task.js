module.exports = function (sequelize, Sequelize) {

    var Task = sequelize.define('lp_task', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        milestone: {
            type: Sequelize.TEXT,
            notEmpty: true
        },

        owners: {
            type: Sequelize.TEXT,
            notEmpty: true
        },

        task_name: {
            type: Sequelize.TEXT
        },

        task_type: {
            type: Sequelize.TEXT,
        },

        e_start: {
            type: Sequelize.DATE,
            allowNull: false
        },

        e_finish: {
            type: Sequelize.DATE
        },

        deadline: {
            type: Sequelize.DATE
        },
        hrs_logged: {
            type: Sequelize.REAL
        },
        started_on: {
            type: Sequelize.DATE
        },
        date_done: {
            type: Sequelize.DATE
        },
        project_id: {
            type: Sequelize.INTEGER
        },
        in_tags: {
            type: Sequelize.TEXT
        },
        hrs_remaning: {
            type: Sequelize.REAL
        }

    });

    return Task;

}