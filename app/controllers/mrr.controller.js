const db = require('../models')
const Op = db.Sequelize.Op
const dates = require('./dates.controller')
const site_data = require('./site_data.controller')
const quater_month_map = {
  1: {
    months: [1, 2, 3],
  },
  2: {
    months: [4, 5, 6]
  },
  3: {
    months: [7, 8, 9]
  },
  4: {
    months: [10, 11, 12]
  }
}
module.exports = {
  month_detail,
  quarter_detail,
  year_detail,
  __roundNumber
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
  let startingBacklog = await __startingbacklog(month, year)
  let psStartingBacklog = await __teamStartingBacklog(month, year, 1)
  let daStartingBacklog = await __teamStartingBacklog(month, year, 2)
  let target = await __getTargetMonth(month, year)
  let activated = await __getActivated(firstDay, lastDay)
  let percentActivated = site_data.percent(activated, startingBacklog)
  let variance = __roundNumber(((backlog + activated) - target), 2)
  let total = activated + backlog
  let psActivated = await __getPSActivated(firstDay, lastDay)
  let daActivated = await __getDAActivated(firstDay, lastDay)

  return { target, backlog, activated, variance, psActivated, daActivated, total, startingBacklog, percentActivated, psStartingBacklog, daStartingBacklog }
}

async function quarter_detail(quarter, year) {

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
  let target = await __getTargetQuarter(quarter, year)
  let activated = await __getActivated(firstDay, lastDay)
  let variance = __roundNumber(((backlog + activated) - target), 2)
  let total = activated + backlog
  let psActivated = await __getPSActivated(firstDay, lastDay)
  let daActivated = await __getDAActivated(firstDay, lastDay)

  return { target, backlog, activated, variance, psActivated, daActivated, total }

}

async function __startingbacklog(month, year) {
  let mrr = 0
  let backlog = await db.mrr_backlog.findOne({
    where: {
      cft_id: null,
      month: month,
      year: year
    }
  })
  if (backlog) {
    mrr = backlog.backlog
  }
  return mrr
}

async function __teamStartingBacklog(month, year, teamID) {
  let mrr = 0
  let backlog = await db.mrr_backlog.findOne({
    where: {
      cft_id: teamID,
      month: month,
      year: year
    }
  })
  if (backlog) {
    mrr = backlog.backlog
  }
  return mrr
}

async function year_detail(year) {
  var today = dates.today()

  if (year === undefined) {
    year = dates.currentYear()
  }

  var firstDay = dates.startOfYear(year)
  var lastDay = dates.endOfYear(year)
  var backlogfirstDay = firstDay

  if (dates.moment(today).isAfter(firstDay)) {
    backlogfirstDay = today
  }

  let backlog = await __getBacklog(backlogfirstDay, lastDay)
  let target = await __getTargetYear(year)
  let activated = await __getActivated(firstDay, lastDay)
  let variance = __roundNumber(((backlog + activated) - target), 2)
  let total = activated + backlog
  let psActivated = await __getPSActivated(firstDay, lastDay)
  let daActivated = await __getDAActivated(firstDay, lastDay)

  return { target, backlog, activated, variance, psActivated, daActivated, total }
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
  return __roundNumber(mrrTarget, 2)
}

async function __getTargetQuarter(quarter, year) {
  quarter = quater_month_map[quarter]
  var mrrTarget = 0
  var target = await db.mrr_targets.sum('target', {
    where: {
      year: year,
      cft_id: null,
      month: {
        [Op.in]: quarter.months
      }
    }
  })

  if (target) {
    mrrTarget = target
  }
  return __roundNumber(mrrTarget, 2)
}

async function __getTargetYear(year) {
  var mrrTarget = 0
  target = await db.mrr_targets.sum('target', {
    where: {
      year: year,
      cft_id: null
    }
  })
  if (target) {
    mrrTarget = target
  }
  return __roundNumber(mrrTarget, 2)
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
  return __roundNumber(backlog, 2)
}
/**
 * Get the activated total for a date range
 *
 * @param {number} firstDay
 * @param {number} lastDay
 * @returns {number}
 */
async function __getActivated(firstDay, lastDay) {
  let activated = await db.lbs.sum('total_mrr', {
    where: {
      actual_go_live: {
        [Op.between]: [firstDay, lastDay]
      }
    }
  })
  if (!activated) {
    activated = 0
  }
  return __roundNumber(activated, 2)
}
/**
 * Get the total MRR PS Activated in a Date Range
 *
 * @param {date} firstDay
 * @param {date} lastDay
 * @returns {number}
 */
async function __getPSActivated(firstDay, lastDay) {

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
  return __roundNumber(psActivated, 2)
}

/**
 *
 * Get the total MRR DA Acitivated in a Date Range
 * @param {date} firstDay
 * @param {date} lastDay
 * @returns {number}
 */
async function __getDAActivated(firstDay, lastDay) {
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

  return __roundNumber(daActivated, 2)
}

function __roundNumber(number, digits) {
  if (number !== 0) {
    let power = Math.pow(10, digits)
    number = Math.round(number * power) / power
  }
  return number
}