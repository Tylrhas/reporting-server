module.exports = {
  month,
  non_associated,
  non_associated_total,
  month_id,
  non_associated_range,
  archive_years,
  month_goals,
  current_backlog,
  starting_backlog,
  team_backlog_detail
}
var db = require('../../models')
var Sequelize = require("sequelize")
const Op = Sequelize.Op
var cfts = require('./cft')


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
        [Op.notIn]: ["SEM Only", "Digital Advertising"]
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
        [Op.notIn]: ["SEM Only", "Digital Advertising"]
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
async function current_backlog (firstDay, lastDay) {
  let date = new Date()
  lastDay = new Date(lastDay)

  // check if the date is greater than current date 
  if (lastDay >= date) {
    // display the backlog
    firstDay = date
    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)
    return cfts.getall().then(teams => {
      console.log(teams)
      // get all projects and associated MRR

      return db.lp_project.findAll({
        attributes: ['cft_id', [db.sequelize.fn('sum', db.sequelize.col('lbs.total_mrr')), 'backlog']],
        include: [
          {
            model: db.lbs,
            attributes: [],
            where: {
              estimated_go_live: {
                [Op.between]: [firstDay, lastDay]
              },
              actual_go_live: null
            }
          }
        ],
        group: ['lp_project.cft_id', 'lp_project.id']
      }).then(results => {
        var team_backlog = {}
        for (i = 0; i < results.length; i++) {
          // create the team if it doesnt exist in the object and add the MRR to the backlog
          let team_id = results[i]['dataValues']['cft_id']
          if (team_backlog.hasOwnProperty([team_id])) {
            // add MRR
            team_backlog[team_id].mrr = team_backlog[team_id].mrr + results[i]['dataValues']['backlog']
          } else {
            // create the key and add in MRR
            team_backlog[team_id] = {
              mrr: results[i]['dataValues']['backlog']
            }
          }
        }
        return team_backlog
      })
    })
  } else {
    return cfts.getall().then(cfts => {
      var backlog_totals = {}
      for (i = 0; i < cfts.length; i++) {
        var cft_id = cfts[i].id
        backlog_totals[cft_id] = {
          backlog_total: 0
        }
      }
      return backlog_totals
    })
  }
}

function starting_backlog (month, year) {
  return db.mrr_backlog.findAll({
    where: {
      month: month,
      year: year,
      cft_id: {
        [Op.not]: null
      },
    },
    attributes: ['cft_id', 'backlog']
  }).then(backlog => {
    let starting_backlog = {

    }
    for (i = 0; i < backlog.length; i++) {
      starting_backlog[backlog[i].dataValues.cft_id] = {
        backlog: backlog[i].dataValues.backlog
      }
    }
    return starting_backlog
  })
}
async function team_backlog_detail (cft_id, lastDay) {
  let date = new Date()
  lastDay = new Date(lastDay)
  

  if (lastDay >= date) {
    var firstDay = date
    if (cft_id === 0) {
      let lbs = await db.lbs.findAll({
        where: {
          project_id: null,
          task_id: null,
          estimated_go_live: {
            [Op.between]: [firstDay, lastDay]
          },
          project_type: {
            [Op.notIn]: ["SEM Only", "Digital Advertising"]
          }
        }
      })
      return lbs 
    } else {
      let lbs = await db.lp_project.findAll({
        where: {
          cft_id: cft_id
        },
        include: [
          {
            model: db.lbs,
            // attributes: ['total_mrr'],
            where: {
              estimated_go_live: {
                [Op.between]: [firstDay, lastDay]
              },
              actual_go_live: null
            }
          }
        ]
      })
      //  parse the object to get all of the LBS for this team
      lbs_array = []
      for (i = 0; i < lbs.length; i++) {
        lbs_array = lbs_array.concat(lbs[i].lbs)
      }
      console.log(lbs)
      return lbs_array
    }
  } else {
    return null
  }
}