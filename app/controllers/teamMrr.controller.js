const db = require('../models')
sequelize = db.sequelize
Op = db.Sequelize.Op
const mrrController = require('./mrr.controller')
module.exports = {
  backlogTotal,
  backlog,
  startingBacklog,
  activatedTotal,
  activated,
  target,
  percent,
  nonAssociatedActivation,
  nonAssociatedActivationTotal,
  nonAssociatedBacklog,
  nonAssociatedBacklogTotal
}
async function target(month, year, teamId) {
  let target = await db.mrr_targets.findOne({
    where: {
      month: month,
      year: year,
      cft_id: teamId
    }
  })
  if (!target) {
    target = 0
  } else {
    target = target.target
  }
  return target
}
async function backlogTotal(firstDay, lastDay, teamId) {
  let projects = await db.lp_project.findAll({
    attributes: ['id', 'cft_id'],
    where: {
      cft_id: teamId
    },
    include: [
     {
      model: db.lbs,
      attributes: ['total_mrr', 'project_id'],
      where: {
        estimated_go_live: {
        [Op.between]: [firstDay, lastDay]
       }
      }
     }
    ]
   })
    var teamMRR = 0
    for (let i = 0; i < projects.length; i++) {
      let lsb = projects[i].lbs
      for (let i2 = 0; i2 < lsb.length; i2++) {
        teamMRR = teamMRR + lsb[i2].total_mrr
      }
    }

  return mrrController.__roundNumber(teamMRR, 2)
}

async function backlog(firstDay, lastDay, teamId) {
  let projects = await db.lp_project.findAll({
    where: {
     cft_id: teamId
    },
    include: [
     {
      model: db.lbs,
      where: {
       estimated_go_live: {
        [Op.between]: [firstDay, lastDay]
       },
       actual_go_live: null
      }, include: [
       {
        model: db.lp_user,
        attributes: ['first_name', 'last_name']
       }
      ]
     },
     {
      model: db.treeitem,
      where: {
       child_type: 'project'
      }
     }
    ]
   })
   //  parse the object to get all of the LBS for this team
   locations = []
   for (i = 0; i < projects.length; i++) {
    locations = locations.concat(projects[i].lbs)
   }
   return { locations, projects}
}
async function startingBacklog(month, year, teamId) {
  let backlog = await db.mrr_backlog.findOne({
    where: {
      month: month,
      year: year,
      cft_id: teamId
    }
  })
  if (!backlog) {
    backlog = 0
  } else {
    backlog = backlog.backlog
  }
  return backlog
}
async function activatedTotal(firstDay, lastDay, teamId) {
  let projects = await db.lp_project.findAll({
    attributes: ['id', 'cft_id'],
    where: {
      cft_id: teamId
    },
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
    var teamMRR = 0
    for (let i = 0; i < projects.length; i++) {
      let lsb = projects[i].lbs
      for (let i2 = 0; i2 < lsb.length; i2++) {
        teamMRR = teamMRR + lsb[i2].total_mrr
      }
    }

  return mrrController.__roundNumber(teamMRR, 2)
}

async function activated(firstDay, lastDay, teamId) {
  return db.lp_project.findAll({
    where: {
     cft_id: teamId
    },
    include: [
     {
      model: db.treeitem,
      attributes: ['name'],
      where: {
       child_type: 'project'
      }
     },
     {
      model: db.lbs,
      attributes: ['total_mrr'],
      where: {
       actual_go_live: {
        [Op.between]: [firstDay, lastDay]
       }
      }
     }
    ]
   })
}
function percent(goal, actual ) {
  let percent = 0
  if (goal != 0) {
    percent = (actual / goal) * 100
    percent = mrrController.__roundNumber(percent, 2)
  } 
  return percent
}
async function nonAssociatedActivation(firstDay, lastDay) {
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
    },
    include: [
     {
      model: db.lp_user,
      attributes: ['first_name', 'last_name']
     }
    ]
   })
}
async function nonAssociatedActivationTotal(firstDay, lastDay) {
  let lbs = await nonAssociatedActivation(firstDay, lastDay)
  let total = 0
  for(let i = 0; i < lbs.length; i++) {
      total = total + lbs[i].total_mrr
  }
  return total
}
async function nonAssociatedBacklog(firstDay, lastDay) {
  return db.lbs.findAll({
    where: {
     project_id: null,
     total_mrr: {
      [Op.not]: null
     },
     estimated_go_live: {
      [Op.between]: [firstDay, lastDay]
     },
     project_type: {
      [Op.notIn]: ["SEM Only", "Digital Advertising"]
     }
    },
    include: [
     {
      model: db.lp_user,
      attributes: ['first_name', 'last_name']
     }
    ]
   })
}

async function nonAssociatedBacklogTotal (firstDay, lastDay) {
  let lbs = await nonAssociatedBacklog(firstDay, lastDay)
  let total = 0
  for(let i = 0; i < lbs.length; i++) {
      total = total + lbs[i].total_mrr
  }
  return total
}