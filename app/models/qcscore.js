module.exports = function (sequelize, Sequelize) {

    var qcScore = sequelize.define('gd_qcscore', {

        id: {
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        projectmanager: {
            type: Sequelize.STRING,
        },

        wis: {
            type: Sequelize.STRING,
        },

        staging: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },
        prelive: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },
        live: {
            type: Sequelize.INTEGER,
            notEmpty: true
        }
    },
    {
        //use a sinular table name
        freezeTableName: true,
    });

    return qcScore;

}