var db = require('../models')
module.exports = {
  getAllProjects,
  getProject,
  updateGoal
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

async function updateGoal(req, res) {
  try {
    let body = req.body
    if ('id' in body) {
      await db.mrr_targets.upsert(body)
      res.send(200)
    } else {
      await db.mrr_targets.create(body)
    }
  } catch (err) {
    res.send(err.message)
  }
}