var db = require('../../models')
var Sequelize = require("sequelize")
const Op = Sequelize.Op

var quater_month_map_targets = {
  1: {
    months: [1,2,3],
  },
  2: {
    months: [4,5,6]
  },
  3: {
    months: [7,8,9]
  },
  4: {
    months: [10,11,12]
    }
}

module.exports = {
  activated_total,
  activated_ps_total,
  activated_da_total, 
  backlog_total,
  month_target,
  quarter_target,
  year_target,
  checkVariance,
  archive_years
}
function month_target (month, year) {
  return db.mrr_targets.findAll({
    where: {
      month: month,
      year: year,
      cft_id: null
    }
  }).then(results => {
    return results[0].target
  })

}
function quarter_target (quarter, year) {
  quarter = quater_month_map_targets[quarter]
  console.log(quarter.months)
  return db.mrr_targets.sum('target',{
    where: {
      year: year,
      cft_id: null,
      month: {
        [Op.in]: quarter.months
      }
    }
  })
}
function year_target (year) {
  return db.mrr_targets.sum('target',{
    where: {
      year: year,
      cft_id: null
    }
  })
}


function activated_total(firstDay, lastDay) {
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

function checkVariance (total, target) {
  if (typeof total === 'string') {
    total = parseFloat(total.replace(/,/g , ''))
  }
  if (typeof target === 'string') {
    target = parseFloat(target.replace(/,/g , ''))
  }
  let variancePercent = 100 * (total / target)
  if (variancePercent > 90) {
    return 'green'
  } else if (variancePercent < 90 && variancePercent > 75) {
    return 'yellow'
  } else {
    return 'red'
  }
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