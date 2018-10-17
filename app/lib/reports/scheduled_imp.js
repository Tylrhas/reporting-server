var projects = require('../controllers/projects')
var db = require('../../models')
module.exports = {
 getQueue,
}

async function getQueue() {
 // get all the projects that are not complete
 return activeProjects()
}

function activeProjects() {
 // get current active projects
 return db.lp_project.findAll({
  where: {
   is_done: false,
   is_archived: false,
   is_on_hold: false
  },
  include: [
   {
    model: db.lbs
   },
   {
    model: db.treeitem,
    where: {
    child_type: 'milestone'
    }
   }
  ]
 })
}