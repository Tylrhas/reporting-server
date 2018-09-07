module.exports = function (sequelize, Sequelize) {

  var mrr_targets = sequelize.define('mrr_targets', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    target: {
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

  return mrr_targets;

}