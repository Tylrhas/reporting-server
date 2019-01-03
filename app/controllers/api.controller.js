var db = require('../models')
module.exports = {
  getAllProjects
}

async function getAllProjects (req, res) {
  let allProjects = await db.lp_project.findAll()
  res.json(allProjects)
}