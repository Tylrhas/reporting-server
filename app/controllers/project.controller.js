const db = require('../models')
const Op = db.Sequelize.Op
const dates = require('./dates.controller')
const site_data = require('./site_data.controller')
module.exports = {
  averageLocCount,
  locationCount
}
async function averageLocCount(projectIds) {
  let locationCount = 0
  let projects = await db.lp_project.findAll({
    where: {
      id: {
        [Op.in]: projectIds
      } 
    },
    include: [
      {
        model: db.lbs
      }
    ]
  })
  projects.forEach(project => {
    locationCount = locationCount + project.lbs.length
  })
  average  = locationCount / projects.length
  return site_data.roundNumber(average,0)
}

async function locationCount(projectIds) {
  let locationCount = 0
  let projects = await db.lp_project.findAll({
    where: {
      id: {
        [Op.in]: projectIds
      } 
    },
    include: [
      {
        model: db.lbs
      }
    ]
  })
  projects.forEach(project => {
    if (project.dataValues.number_of_locations == null) {
      locationCount = locationCount + project.lbs.length
    } else {
      locationCount = locationCount + project.number_of_locations
    }
  })
  return locationCount
}