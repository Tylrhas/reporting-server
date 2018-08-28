module.exports = {
  current_month,
  non_associated,
  non_associated_total
}
var db = require('../../models')
var Sequelize = require("sequelize")
const Op = Sequelize.Op

function current_month () {
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 0);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  var month = date.getMonth()
  firstDay.setHours(23, 59, 59, 999);
  lastDay.setHours(23, 59, 59, 999);
  return db.lp_project.findAll({
    attributes: ['id', 'cft_id'],
    include: [
      {
        model: db.lbs,
        attributes: ['total_mrr', 'project_id'],
        where: {
          actual_go_live: {
            [Op.between]: [firstDay, lastDay]
          }
        }
      }
    ]
  })
}
function non_associated_total () {
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 0);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  var month = date.getMonth()
  return db.lbs.sum('total_mrr',{
    where: {
      project_id: null,
      total_mrr: {
        [Op.not]: null
      },
      actual_go_live: {
        [Op.between]: [firstDay, lastDay]
      },
      project_type: {
        [Op.notIn] : ["DA Rep & Social", "SEM Only", "Digital Advertising" ]
      }
    }
  })
}

function non_associated () {
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 0);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  var month = date.getMonth()
  return db.lbs.findAll({
    where: {
      project_id: null,
      total_mrr: {
        [Op.not]: null
      },
      actual_go_live: {
        [Op.between]: [firstDay, lastDay]
      },
      project_type: {
        [Op.notIn] : ["DA Rep & Social", "SEM Only", "Digital Advertising" ]
      }
    }
  })
}