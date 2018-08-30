module.exports = {
  month,
  non_associated,
  non_associated_total,
  month_id,
  non_associated_range

}
var db = require('../../models')
var Sequelize = require("sequelize")
const Op = Sequelize.Op

function month (firstDay, lastDay) {
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
function month_id (firstDay, lastDay, id) {
  return db.lp_project.findAll({
    attributes: ['id', 'cft_id'],
    where: {
      cft_id: id
    },
    include: [
      {
        model: db.lbs,
        attributes: ['total_mrr'],
        where: {
          actual_go_live: {
            [Op.between]: [firstDay, lastDay]
          }
        }
      }, 
      {
        model: db.treeitem,
        attributes: ['name'],
        where: {
          child_type: 'project'
        }
      }, {
        model: db.cft,
        attributes: ['name']
      }
    ]
  })
}
function non_associated_total (firstDay, lastDay) {
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
function non_associated_range (firstDay, lastDay) {
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