const db = require('../models')
const mrrController = require('./mrr.controller')
module.exports = {
  getAllProjects,
  getProject,
  updateGoal,
  mrrDetails
}
async function mrrDetails (req, res) {
  var year = parseInt(req.query.year)
  var month = parseInt(req.query.month)
  var quarter = parseInt(req.query.quarter)
  var mrrDetails 
  try {
  if (year && month) {
    mrrDetails = await mrrController.month_detail(month, year)
  } else if (year && quarter) {
    mrrDetails = await mrrController.quarter_detail(quarter, year)
  } else if (year) {
    mrrDetails = await mrrController.year_detail(year)
  } else {
    mrrDetails = 'Please supply a year and a quarter or month'
  }
    res.send(mrrDetails)
  } catch (error) {
    res.send(error.message)
  }
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