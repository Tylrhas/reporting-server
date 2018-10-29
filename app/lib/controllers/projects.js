var exports = module.exports = {
 active: active,
 status: status,
 mrr: mrr,
 createAPIProject: createProject,
 scheduledProjects: scheduledProjects,
 activeCount: activeCount
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

function activeCount(where) {
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
      date_done: {
       [Op.not]: null
      }
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

function scheduledProjects(where) {
 // find all projects that do not have the implementation start milestone
 return db.sequelize.query(`SELECT * FROM lp_projects where lp_projects.id IN 
 ( SELECT project_id 
   FROM treeitem 
   WHERE child_type = 'milestone' 
   AND name like '%Implementation Start%' 
   and date_done is NUll 
  ) 
 AND lp_projects.id IN ( SELECT project_id 
   FROM treeitem 
   WHERE child_type = 'milestone' 
   AND name like '%Implementation Ready%' 
   and date_done is not NUll
  )`, { type: db.Sequelize.QueryTypes.SELECT })
}

exports.createAPIProject = createProject