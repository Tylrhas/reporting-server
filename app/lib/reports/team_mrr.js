module.exports = {
  month,
  non_associated,
  non_associated_total,
  month_id,
  non_associated_range,
  archive_years,
  month_goals
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
function month_goals (month, year) {
  if (month == null || year == null) {
    // this is for the current month
    return db.cft.findAll({
      attributes: ['id'],
      where: {
        id: {
          [Op.not]: 0
        }
      }
    }).then(cft_ids => {
      console.log(cft_ids)
    })
  } else {
    return db.cft.findAll({
      where: {
        id: {
          [Op.not]: 0
        }
      },
      attributes: ['id']
    }).then(cft_ids => {
      let cft_ids_array = []
      for (i = 0; i < cft_ids.length; i++) {
        cft_ids_array.push(cft_ids[i].id)
      }
      return db.mrr_targets.findAll({
        where: {
          cft_id: {
            [Op.in]: cft_ids_array
          },
          month: month,
          year: year
        }
      })
    })
  }
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
  return db.lbs.sum('total_mrr', {
    where: {
      project_id: null,
      total_mrr: {
        [Op.not]: null
      },
      actual_go_live: {
        [Op.between]: [firstDay, lastDay]
      },
      project_type: {
        [Op.notIn]: ["DA Rep & Social", "SEM Only", "Digital Advertising"]
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
        [Op.notIn]: ["DA Rep & Social", "SEM Only", "Digital Advertising"]
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
        [Op.notIn]: ["DA Rep & Social", "SEM Only", "Digital Advertising"]
      }
    }
  })
}

function archive_years () {
  let d = new Date()
  // get all years from 2018 to current year
  let start_year = 2018
  // get current year
  let ending_year = d.getFullYear()
  let years = []
  for (i = start_year; i <= ending_year; i++) {
    years.push(i)
  }
  return years
}