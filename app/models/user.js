module.exports = function (sequelize, Sequelize) {
    var User = sequelize.define('user', {
  
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
  
      first_name: {
        type: Sequelize.STRING
        // notEmpty: true
      },
  
      last_name: {
        type: Sequelize.STRING
        // notEmpty: true
      },
  
      title: {
        type: Sequelize.STRING
        // notEmpty: true
      },
  
      role: {
        type: Sequelize.STRING
        // notEmpty: true
      },
      token: {
        type: Sequelize.STRING
        // notEmpty: true
      },
  
      email: {
        type: Sequelize.STRING
        // notEmpty: true
      },
      user_group: {
        type: Sequelize.ENUM('user', 'admin'),
        defaultValue: 'user'
    }
  
    })
  
    return User
  }