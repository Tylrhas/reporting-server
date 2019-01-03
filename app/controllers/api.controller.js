var db = require('../models')
module.exports = {
  getAllProjects,
  getProject
}

async function getAllProjects(req, res) {
  let allProjects = await db.lp_project.findAll()
  res.json(allProjects)
}

async function getProject(req, res) {
  try {
    var results = await db.treeitem.find({
      where: { id: req.params.project_id },
      include: {
        model: db.treeitem,
        as: 'descendents',
        hierarchy: true
      }
    })
  } catch (error) {
    results = error
  }
  res.json(results)
}