var exports = module.exports = {
 active: active,
 status: status,
 mrr: mrr,
 createAPIProject: createProject,
 scheduledProjects: scheduledProjects,
 count: count
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
 return db.lp_project.findAll({
  where: {
   is_done: false,
   is_archived: false,
   is_on_hold: false
  }
 })
}

function count(where) {
 return db.cft.findAll({
  include: [
   {
    model: db.lp_project,
    where: where,
    include: [{
     model: db.treeitem,
     where: {
      child_type: 'milestone',
      name: {
       [Op.like]: '%Implementation Start%'
      },
      // is_done: true
     }
    }
    ]
   }
  ]
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
 return db.lbs.sum('total_mrr', {
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

function scheduledProjects() {
 // find all projects that do not have the implementation start milestone
 return db.lp_project.findAll({
  where: {
   is_done: false,
   is_archived: false,
   is_on_hold: false,
   cft_id: 0
  },
  include: [
   {
    model: db.treeitem,
    where: {
     // name is like implementation start
     // is not complete
    }
   }
  ]
 })
}

exports.createAPIProject = createProject