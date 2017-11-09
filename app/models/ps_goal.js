module.exports = function (sequelize, Sequelize) {
    
        var PsGoal = sequelize.define('ps_goal', {
    
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
    
            goal_date: {
                type: Sequelize.DATE,
                notEmpty: true
            },
    
            mrr: {
                type: Sequelize.DECIMAL,
                notEmpty: true
            },
    
            otr_gross: {
                type: Sequelize.DECIMAL
            },
    
            otr_net: {
                type: Sequelize.DECIMAL,
            }
    
        });
    
        return PsGoal;
    
    }