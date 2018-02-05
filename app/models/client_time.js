module.exports = function (sequelize, Sequelize) {
    
        var lpClientTime = sequelize.define('lp_client_time', {
    
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
    
            lp_task: {
                type: Sequelize.INTEGER,
                notEmpty: true
            },
    
            update_time: {
                type: Sequelize.DATE,
                notEmpty: true
            },
    
            time_logged: {
                type: Sequelize.BOOLEAN
            },
    
            est_updated: {
                type: Sequelize.BOOLEAN,
            },
    
            response: {
                type: Sequelize.TEXT,
                allowNull: false
            }
        },
        {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        //singular table name
        freezeTableName: true,
        });
    
        return lpClientTime;
    
    }