const db = require('../models')
const Op = db.Sequelize.Op
const sequelize = db.sequelize
const site_data = require('./site_data.controller')
module.exports = {
  getQueue,
  getActiveProjects,
  getScheduledProjects,
  getAllProjects,
  getIntakeProjects
}
async function getQueue() {
  // get all projects that are not complete
  var activeProjects = await db.lp_project.findAll({
    attributtes: ['cft_id', 'id'],
    where: {
      cft_id: {
        [Op.notIn]: [0, 48803247] 
      },
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
    var implementationStart = { status: false }
    var implementationReady = { status: false }
    var contractExecution = { status: false }
    var websiteLive = { status: false }
    let project = activeProjects[i]
    if (!(teams.hasOwnProperty(project.cft_id)) && project.cft_id !== 0) {
      teams[project.cft_id] = {
        active: [],
        scheduled: [],
        intake: []
      }
    }
    if (project.cft_id !== 0) {
      projectStarted = false
      // the project is not in the queue
      // check if the implementation start milestone is complete
      for (let i2 = 0; i2 < project.dataValues.treeitems.length; i2++) {
        let milestone = project.dataValues.treeitems[i2]
        if (milestone.name.trim() === 'Contract Execution') {
          // project is scheduled
          contractExecution = {
            milestone: milestone
          }
          if (milestone.date_done !== null) {
            contractExecution.status = true
          }
        }
        if (milestone.name.trim() === 'Implementation Start') {
          // project is scheduled
          implementationStart = {
            milestone: milestone
          }
          if (milestone.date_done !== null) {
            implementationStart.status = true
          }
        }
        if (milestone.name.trim() === 'Implementation Ready') {
          implementationReady = {
            milestone: milestone
          }
          if (milestone.date_done !== null) {
            implementationReady.status = true
          }
        }
        if (milestone.name.trim() === 'Website(s) Live') {
          websiteLive.milestone = milestone
          if (milestone.date_done !== null) {
            websiteLive.status = true
          }
        }
      }
      if (contractExecution.status && !implementationReady.status) {
        teams[project.cft_id].intake.push(project.id)
      }
      else if (implementationReady.status && !implementationStart.status) {
        // project is scheduled
        teams[project.cft_id].scheduled.push(project.id)
      } else if (implementationReady.status && implementationStart.status && !websiteLive.status) {
        // project is active
        teams[project.cft_id].active.push(project.id)
      }
    }
  }
  return await addTeamNames(teams)
  // get all scheduled projects that dont have a team
}

async function addTeamNames(teamCount) {
  let teams = await db.cft.findAll({
    where: {
      real_team: true,
      id: {
        [Op.not]: 0
      }
    }
  })
  for (let i = 0; i < teams.length; i++) {
    if (teamCount.hasOwnProperty(teams[i].id)) {
      teamCount[teams[i].id].name = teams[i].name
      teamCount[teams[i].id].limit = teams[i].wip_limit
    }
  }

  return await convertToArray(teamCount)
}

async function convertToArray(teams) {
  var array = []
  for (let i = 0; i < Object.keys(teams).length; i++) {
    let key = parseInt(Object.keys(teams)[i])
    let object = null
    if (key != 48803247) {
      object = teams[key]
      object.id = key
      object.wipLimit = teams[key].limit
      array.push(object)
    } else {
      object = await intakeData()
      array.unshift(object)
    }
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
    var implementationStart = { status: false }
    var implementationReady = { status: false }
    var websiteLive = { status: false }
    let project = projects[i]
    let milestones = projects[i].dataValues.treeitems
    for (i2 = 0; i2 < milestones.length; i2++) {
      let milestone = project.dataValues.treeitems[i2]
      if (milestone.name.trim() === 'Implementation Start') {
        // project is scheduled
        implementationStart.milestone = milestone
        if (milestone.date_done !== null) {
          implementationStart.status = true
        }
      }
      if (milestone.name.trim() === 'Implementation Ready') {
        implementationReady.milestone = milestone
        if (milestone.date_done !== null) {
          implementationReady.status = true
        }
      }
      if (milestone.name.trim() === 'Website(s) Live') {
        websiteLive.milestone = milestone
        if (milestone.date_done !== null) {
          websiteLive.status = true
        }
      }
    }
    if (implementationReady.status && implementationStart.status && !websiteLive.status) {
      // project is active
      activeProject = {
        id: projects[i].id,
        name: milestones[milestones.length - 1].name,
        locations: project.lbs.length,
        total_mrr: sumLBS(project.lbs),
        start_date: implementationStart.milestone.date_done

      }
      activeProjects.push(activeProject)
    }
  }
  return activeProjects
  // add the project name 
}

async function getScheduledProjects(teamId) {
  var scheduledProject
  var scheduledProjects = []
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
    var milestones = project.treeitems
    var implementationStart = { status: false }
    var implementationReady = { status: false }
    for (let i2 = 0; i2 < milestones.length; i2++) {
      let milestone = milestones[i2]
      if (milestone.name === 'Implementation Start') {
        // project is scheduled
        implementationStart = {
          milestone: milestone
        }
        if (milestone.date_done !== null) {
          implementationStart.status = true
        }
      }
      if (milestone.name === 'Implementation Ready') {
        implementationReady = {
          milestone: milestone
        }
        if (milestone.date_done !== null) {
          implementationReady.status = true
        }
      }
    }
    if (implementationReady.status && !implementationStart.status) {
      // the project is scheduled
      scheduledProject = {
        id: projects[i].id,
        name: milestones[milestones.length - 1].name,
        locations: project.lbs.length,
        total_mrr: sumLBS(project.lbs),
        start_date: implementationReady.milestone.date_done
      }
      scheduledProjects.push(scheduledProject)
    }
  }
  return scheduledProjects
}
async function getIntakeProjects(teamId) {
  var intakeProject
  var intakeProjects = []
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
    var milestones = project.treeitems
    var contractExecution = { status: false }
    var implementationReady = { status: false }
    for (let i2 = 0; i2 < milestones.length; i2++) {
      let milestone = milestones[i2]
      if (milestone.name === 'Contract Execution') {
        // project is scheduled
        contractExecution = {
          milestone: milestone
        }
        if (milestone.date_done !== null) {
          contractExecution.status = true
        }
      }
      if (milestone.name === 'Implementation Ready') {
        implementationReady = {
          milestone: milestone
        }
        if (milestone.date_done !== null) {
          implementationReady.status = true
        }
      }
    }
    if (contractExecution.status && !implementationReady.status) {
      // the project is scheduled
      intakeProject = {
        id: projects[i].id,
        name: milestones[milestones.length - 1].name,
        locations: project.lbs.length,
        total_mrr: sumLBS(project.lbs),
        start_date: contractExecution.milestone.date_done
      }
      intakeProjects.push(intakeProject)
    }
  }
  return intakeProjects
}

function sumLBS(lbs) {
  var total = 0
  for (let i = 0; i < lbs.length; i++) {
    console.log(lbs[i].total_mrr)
    total = lbs[i].total_mrr + total
  }
  return total
}

async function intakeData() {
  let locations = 0
  let mrr = 0
  let projects = await db.lp_project.findAll({
    where: {
      cft_id: 48803247
    },
    include: [
      {
        model: db.lbs
      }
    ]
  })
  for (let i = 0; i < projects.length; i++) {
    let project = projects[i]
    for (let i2 = 0; i2 < project.lbs.length; i2++) {
      let lbs = project.lbs[i2]
      mrr = mrr + lbs.total_mrr
    }
    locations = locations + project.lbs.length
  }
  return {
    id: 48803247,
    name: 'Intake',
    projects: projects.length,
    locations: locations,
    mrr: mrr
  }
}

async function getAllProjects(cft_id) {
  let array = []
  let projects = await db.lp_project.findAll({
    attributtes: ['id'],
    where: {
      cft_id: cft_id,
      done_on: null,
      is_done: false,
      is_on_hold: false,
      is_archived: false
    },
    include: [
      {
        model: db.treeitem,
        where: {
          child_type: 'project'
        }
      },
      {
        model: db.lbs
      }
    ]
  })
  for (let i = 0; i < projects.length; i++) {
    let project = projects[i]
    let total_mrr = 0
    for (let i2 = 0; i2 < project.lbs.length; i2++) {
      lbs = project.lbs[i2]
      total_mrr = total_mrr + lbs.total_mrr
    }
    array.push({
      name: project.treeitems[0].name,
      id: project.id,
      locations: project.lbs.length,
      total_mrr: total_mrr
    })
  }
  return array
}