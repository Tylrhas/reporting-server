var db = require('../../models')
var Sequelize = require("sequelize")
const Op = Sequelize.Op


module.exports = {
  activated_total,
  activated_ps_total,
  activated_da_total, 
  backlog_total
}


async function activated_total(firstDay, lastDay) {
  return db.lbs.sum('total_mrr', {
    where: {
      actual_go_live: {
        [Op.between]: [firstDay, lastDay]
      }
    }
  })
}
async function activated_ps_total(firstDay, lastDay) {
  return db.lbs.sum('total_mrr', {
    where: {
      actual_go_live: {
        [Op.between]: [firstDay, lastDay]
      },
      project_type: {
          [Op.notIn]: ["DA Rep & Social", "SEM Only", "Digital Advertising"]
      }

    }
  })
  
}
async function activated_da_total(firstDay, lastDay) {
  return db.lbs.sum('total_mrr', {
    where: {
      actual_go_live: {
        [Op.between]: [firstDay, lastDay]
      },
      project_type: ["DA Rep & Social", "SEM Only", "Digital Advertising"]
    }
  })
  
}

async function backlog_total (firstDay, lastDay) {
  return db.lbs.sum('total_mrr', {
    where: {
        estimated_go_live: {
            [Op.between]: [firstDay, lastDay]
        },
        actual_go_live: null
    }
})
}