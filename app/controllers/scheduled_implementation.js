db = require('../models')
Op = db.Sequelize.Op
sequelize = db.sequelize
module.exports = {
 getQueue,
 getActiveProjects
}
async function getQueue() {
 // get all projects that are not complete
 var activeProjects = await db.lp_project.findAll({
  attributtes: ['cft_id', 'id'],
  where: {
   done_on: null,
   is_done: false,
   is_on_hold: false,
   is_archived: false
  },
  include: [
   {
    model: db.treeitem,
    where: {
     child_type: 'milestone'
    }
   }
  ]
 })
 var teams = {}
 for (let i = 0; i < activeProjects.length; i++) {
  let project = activeProjects[i]
  if (!(teams.hasOwnProperty(project.cft_id))) {
   teams[project.cft_id] = {
    active: [],
    scheduled: []
   }
  }
  if (project.cft_id !== 0) {
   projectStarted = false
   // the project is not in the queue
   // check if the implementation start milestone is complete
   for (let i2 = 0; i2 < project.dataValues.treeitems.length; i2++) {
    let milestone = project.dataValues.treeitems[i2]
    // itterate through the milestones looking for implementation start
    if (milestone.name === 'Implementation Start' && milestone.date_done !== null) {
     // count the project as active
     teams[project.cft_id].active.push(project.id)
     projectStarted = false
    }
   }
   if (!projectStarted) {
    teams[project.cft_id].scheduled.push(project.id)
   }
  } else {
   // it is not part of a team
   teams[project.cft_id].scheduled.push(project.id)
  }
 }
 return await addTeamNames(teams)
 // get all scheduled projects that dont have a team
}

async function addTeamNames(teamCount) {
 let teams = await db.cft.findAll({
  attributtes: ['id', 'name']
 })
 for (let i = 0; i < teams.length; i++) {
  if (teamCount.hasOwnProperty(teams[i].id)) {
   teamCount[teams[i].id].name = teams[i].name
  }
 }

 return convertToArray(teamCount)
}

function convertToArray(teams) {
 var array = []
 var wipLimits = {
  44790301: {
   limit: 45
  },
  46132813: {
   limit: 36
  },
  46132814: {
   limit: 36
  },
  46132815: {
   limit: 24
  },
  46132816: {
   limit: 36
  },
  46132817: {
   limit: 48
  },
  0: {
   limit: 0
  }
 }
 for (let i = 0; i < Object.keys(teams).length; i++) {
  let key = Object.keys(teams)[i]
  let object = teams[key]
  object.id = key
  object.wipLimit = wipLimits[key].limit
  array.push(object)
 }

 return array

}
async function getActiveProjects(teamId) {
 var activeProject
 var activeProjects = []
 var projects = await db.lp_project.findAll({
  attributes: ['id', 'cft_id'],
  where: {
   cft_id: teamId,
   is_done: false,
   is_on_hold: false,
   is_archived: false
  },
  include: [
   {
    model: db.treeitem,
    where: {
     child_type: {
      [Op.or]: ['milestone', 'project']
     }
    }
   },
   {
    model: db.lbs
   }
  ],
  order: [
   [db.treeitem, 'child_type']
  ]
 })
 for (let i = 0; i < projects.length; i++) {
  let project = projects[i]
  let milestones = projects[i].dataValues.treeitems
  for (i2 = 0; i2 < milestones.length; i2++) {
   let milestone = milestones[i2]
   if (milestone.name === 'Implementation Start' && milestone.date_done !== null) {
    // push the project into active projects
    activeProject = {
     id: projects[i].id,
     name: milestones[milestones.length - 1].name,
     locations: project.lbs.length,
     total_mrr: sumLBS(project.lbs),
     start_date: milestone.date_done

    }
    activeProjects.push(activeProject)
   }
  }
 }
 return activeProjects
 // add the project name 
}

function sumLBS(lbs) {
 total = 0
 for (let i = 0; i < lbs.length; i++) {
  total + lbs[i].total_mrr
 }
 return total
}