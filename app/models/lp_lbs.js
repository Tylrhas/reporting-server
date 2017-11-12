module.exports = function (sequelize, Sequelize) {

    var LpLbs = sequelize.define('lp_lbs', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        ns_id: {
            type: Sequelize.INTEGER
        },
        in_tags: {
            type: Sequelize.TEXT
        },
        task_name: {
            type: Sequelize.TEXT
        },
        project_id: {
            type: Sequelize.INTEGER
        },
        website_type: {
            type: Sequelize.TEXT
        },
        design_type: {
            type: Sequelize.TEXT
        },
        updated_on: {
            type: Sequelize.DATE
        }
    },
        {
            //use a sinular table name
            freezeTableName: true,
            // don't add the timestamp attributes (updatedAt, createdAt)
            timestamps: false
        });
    return LpLbs;
}