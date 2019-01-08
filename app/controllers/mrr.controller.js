const db = require('../models')
const Op = db.Sequelize.Op
const dates = require('./dates.controller')
const quater_month_map = {
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
  month_detail,
  quarter_detail
}
/**
 * Gets the MRR details for a given month
 *
 * @param {?number} month
 * @param {?number} year
 * @returns {{target: number, backlog: number, actvated: number, variance: number, psActivated: number, daActivated: number} | {error: string}}
 */
async function month_detail(month, year) {
  var today = dates.today()
  if (month === undefined || year === undefined) {
    month = dates.currentMonth()
    year = dates.currentYear()
  }
  var firstDay = dates.firstDay(month, year)
  var lastDay = dates.lastDay(month, year)
  var backlogfirstDay = firstDay

  if (dates.moment(today).isAfter(firstDay)) {
    backlogfirstDay = today
  }

  let backlog = await __getBacklog(backlogfirstDay, lastDay)
  let target = await __getTargetMonth(month, year)
  let actviated = await __getActivated(firstDay, lastDay)
  let variance = ((backlog + actviated) - target)
  let psActivated = await __getPSActivated(firstDay, lastDay)
  let daActivated = await __getDAActivated(firstDay, lastDay)

  return { target, backlog, actviated, variance, psActivated, daActivated }
}

async function quarter_detail (quarter, year) {

  var today = dates.today()
  if (quarter === undefined || year === undefined) {
    month = dates.currentMonth()
    year = dates.currentYear()
    quarter = dates.currentQuarter()
  }
  var firstDay = dates.startOfQuarter(quarter)
  var lastDay = dates.endOfQuarter(quarter)
  var backlogfirstDay = firstDay

  if (dates.moment(today).isAfter(firstDay)) {
    backlogfirstDay = today
  }

  let backlog = await __getBacklog(backlogfirstDay, lastDay)
  let target = await __getTargetMonth(month, year)
  let actviated = await __getActivated(firstDay, lastDay)
  let variance = ((backlog + actviated) - target)
  let psActivated = await __getPSActivated(firstDay, lastDay)
  let daActivated = await __getDAActivated(firstDay, lastDay)

    return { target, backlog, actviated, variance, psActivated, daActivated }

}
/**
 * Gets a months target from the database
 *
 * @param {number} month
 * @param {number} year
 * @returns {?number}
 */
async function __getTargetMonth(month, year) {
  mrrTarget = 0
  let target = await db.mrr_targets.findOne({
    where: {
      month: month,
      year: year,
      cft_id: null
    }
  })
  if (target) {
    mrrTarget = target.target
  } 
  return mrrTarget
}
/**
 * Gets the backlog for a given month
 *
 * @param {number} firstDay
 * @param {number} lastDay
 * @returns {number}
 */
async function __getBacklog(firstDay, lastDay) {
  let backlog 
  if (dates.moment(firstDay).isBefore(lastDay)) {
    backlog = await db.lbs.sum('total_mrr', {
      where: {
        estimated_go_live: {
          [Op.between]: [firstDay, lastDay]
        },
        actual_go_live: null
      }
    })
  }
  if (!backlog) {
    backlog = 0
  }
  return backlog
}
/**
 * Get the activated total for a date range
 *
 * @param {number} firstDay
 * @param {number} lastDay
 * @returns {number}
 */
async function __getActivated (firstDay, lastDay) {
  let activated = await db.lbs.sum('total_mrr', {
    where: {
      actual_go_live: {
        [Op.between]: [firstDay,lastDay]
      }
    }
  })
  if (!activated) {
    activated = 0
  }
  return activated
}
/**
 * Get the total MRR PS Activated in a Date Range
 *
 * @param {date} firstDay
 * @param {date} lastDay
 * @returns {number}
 */
async function __getPSActivated (firstDay, lastDay) {
  
  let psActivated = await db.lbs.sum('total_mrr', {
    where: {
      actual_go_live: {
        [Op.between]: [firstDay, lastDay]
      },
      project_type: {
          [Op.notIn]: ["DA Rep & Social", "SEM Only", "Digital Advertising"]
      }
    }
  })
  if (!psActivated) {
    psActivated = 0
  } 
  return psActivated
}

/**
 *
 * Get the total MRR DA Acitivated in a Date Range
 * @param {date} firstDay
 * @param {date} lastDay
 * @returns {number}
 */
async function __getDAActivated (firstDay, lastDay) {
  let daActivated = await db.lbs.sum('total_mrr', {
    where: {
      actual_go_live: {
        [Op.between]: [firstDay, lastDay]
      },
      project_type: ["DA Rep & Social", "SEM Only", "Digital Advertising"]
    }
  })

  if (!daActivated) {
    daActivated = 0
  }
  
  return daActivated
}