module.exports = function(sequelize, Sequelize) {
    
       var Job = sequelize.define('job', {
    
           id: {
               autoIncrement: true,
               primaryKey: true,
               type: Sequelize.INTEGER
           },
    
           jobname: {
               type: Sequelize.STRING,
               notEmpty: true
           },
               
           lastrun: {
               type: Sequelize.DATE
           },

           lastrunstatus: {
            type: Sequelize.ENUM('complete', 'error'),
            defaultValue: 'complete'
        },
           status: {
               type: Sequelize.ENUM('active', 'inactive'),
               defaultValue: 'active'
           }
    
       });
    
       return Job;
    
   }