module.exports = function (sequelize, Sequelize) {

    var LpLbs = sequelize.define('lp_lbs', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        task_name: {
            type: Sequelize.TEXT
        },
        in_tags: {
            type: Sequelize.TEXT
        },
        website_type: {
            type: Sequelize.TEXT
        },
        design_type: {
            type: Sequelize.TEXT
        },
        project_id: {
            type: Sequelize.INTEGER
        },
        ns_id: {
            type: Sequelize.INTEGER
        },
        billing_type: {
            type: Sequelize.TEXT
        },
        billing_lost_reason: {
            type: Sequelize.TEXT
        }
    },
        {
            //use a sinular table name
            freezeTableName: true,
        });
    return LpLbs;
}