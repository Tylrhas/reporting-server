module.exports = function (sequelize, Sequelize) {
    
        var PsWeight = sequelize.define('ps_weight', {
    
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
    
            weight_type: {
                type: Sequelize.TEXT,
                notEmpty: true
            },
    
            pm_mod: {
                type: Sequelize.REAL,
                notEmpty: true
            },
    
            weight_value: {
                type: Sequelize.TEXT
            }

        });
    
        return PsWeight;
    
    }