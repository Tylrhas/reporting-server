module.exports = function (sequelize, Sequelize) {

  var mrr_backlog = sequelize.define('mrr_backlog', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    backlog: {
      type: Sequelize.REAL,
      notEmpty: true
    },
    month: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },
    year: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },
    cft_id: {
      type: Sequelize.INTEGER,
  }
  });

  return mrr_backlog;

}