var projects = require('../controllers/projects')
var db = require('../../models')
var Sequelize = require("sequelize")
const Op = Sequelize.Op
module.exports = {
 getQueue,
}
var milestoneLUT = {
 'Contract Execution': 'Implementaion Ready',
 'Implementaion Ready': 'Implementation Start',
 'Implementation Start': 'Build Ready',
 'Build Ready': 'Staging Links Delivered',
 'Staging Links Delivered': 'Client Approval',
 'Client Approval': ' Launch Approval'
}
var milestones = [
 'Project Closed',
 'Launch Approval',
 'Client Approval', 
 'Staging Links Delivered',
 'Build Ready',
 'Implementation Start',
 'Implementaion Ready',
 'Contract Execution'
]

async function getQueue() {
 // get all the projects that are not complete
 var inProgress = await activeProjects()
 for (let i = 0; i < inProgress.length; i++) {
  inProgress[i].dataValues.lastCompletedMilestone = {
   name: 'No Milestone Completed'
  }
  inProgress[i].dataValues.total_mrr = 0
  // get last completed milestone
  // for the number of milestones look for that key
  for (let mi = 0; mi < milestones.length; mi++) {
   if (inProgress[i].treeitems.hasOwnProperty(milestones[mi])) {
    inProgress[i].dataValues.lastCompletedMilestone = inProgress[i].treeitems[milestones[mi]]
    break
   }
  }
  // Sum MRR for this project
  for (let i2 = 0; i2 < inProgress[i].lbs.length; i2++) {
   inProgress[i].dataValues.total_mrr = inProgress[i].lbs[i2].total_mrr + inProgress[i].dataValues.total_mrr
  }
 }
 return inProgress
}

async function activeProjects() {
 // get current active projects
 let queue = await db.lp_project.findAll({
  where: {
   is_done: false,
   is_archived: false,
   is_on_hold: false
  },
  include: [
   {
    model: db.lbs,
    attributes: ['total_mrr']
   },
   {
    model: db.cft,
    attributes: ['name']
   },
   {
    model: db.treeitem,
    where: {
     child_type: 'milestone',
     date_done: {
      [Op.not] : null
     }
    }
   }
  ],
  order: [
   [
    { model: db.treeitem }, 'date_done', 'DESC'],
   ['started_on', 'DESC'],
   ['createdAt', 'DESC']
  ]
 })

 for (let i = 0; i < queue.length; i++ ) {
  let treeitems = {}
  for (let ti = 0; ti < queue[i].treeitems.length; ti++) {
   key = parseMilestoneName(queue[i].treeitems[ti].name)
   if (key === null) {
    console.log('yikes')
   } else {
    treeitems[key] = queue[i].treeitems[ti]
   }
  }
  queue[i].treeitems = treeitems
 }

 return queue
}

function parseMilestoneName(milestoneName) {
 for (let i = 0; i < milestones.length; i++) {
  if (milestoneName.indexOf(milestones[i]) !== -1) {
   // it is a match - return it 
   return milestones[i]
  }
 }
 return null
}

function checkNextMilestone(milestoneName, milestoneArray, currentMilestone) {
 let nextMilestoneName = milestoneLUT[milestoneName]
 for (let ti = 0; ti < milestoneArray.length; ti++) {
  if (milestoneArray[ti].name.indexOf(nextMilestoneName) !== -1) {
   if (milestoneArray[ti].date_done !== null) {
    // set the current milestone
    currentMilestone = milestoneArray[ti]
    // remove the current milestone to avoid duplicate checks
    milestoneArray.splice(ti,1)
    return checkNextMilestone(nextMilestoneName, milestoneArray, currentMilestone)
   } else {
    return currentMilestone
   }
  }
 }
 return currentMilestone
}