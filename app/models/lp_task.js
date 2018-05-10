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

        task_name: {
            type: Sequelize.TEXT
        },

        task_type: {
            type: Sequelize.TEXT,
        },

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
        },
        cs_offering: {
            type: Sequelize.TEXT,
        },
        ready_on:{
            type: Sequelize.DATE
        },
        parent_id:{
            type: Sequelize.INTEGER
        }


    });
    Task.associate = function (models) {
        // associate project tasks
        models.lp_task.belongsTo(models.lp_project, { foreignKey: 'project_id', sourceKey: 'id' });
         // associate project tasks
         models.lp_task.hasMany(models.lp_project_priority, { foreignKey: 'project_id', sourceKey: 'project_id' });
    };

    return Task;

}