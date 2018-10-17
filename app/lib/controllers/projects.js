var exports = module.exports = {
 active: active,
 status: status,
 mrr: mrr

}
//Models
var db = require("../../models")
var Sequelize = require("sequelize")
const Op = Sequelize.Op

async function createProject(body) {
 return db.lp_project.findOrCreate({
  where: {
   id: body.id
  }
 }).then(() => {
  // create the tree item
  createTreeItem(body)
 })
}

function active() {
 // get current active projects
 return db.lp_projects.findAll({
  where: {
   is_done: false,
   is_archived: false,
   is_on_hold: false
  }
 })
}

async function createTreeItem(body) {
 return db.treeitem.findOrCreate({
  where: {
   id: body.id
  },
  defaults: {
   name: body.name,
  }
 })
  .then(treeitem => {
   treeitem[0].update({
    name: body.name,
   })
  })
}

/**
 *
 *
 * @param {{id:int}} project
 */
function mrr(project) {
 // get the sum of the MRR for this project
return db.lbs.sum('total_mrr',{
 where: {
  project_id: project.id
 }
})
}
function status(project) {
// return all of the milestones
return db.treeitem.findAll({
 where: {
  project_id: project.id
 }
})
} 

exports.createAPIProject = createProject