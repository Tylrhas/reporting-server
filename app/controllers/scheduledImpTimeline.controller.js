const db = require('../models')
const Teamcontroller = require('./team.controller')
const Op = db.Sequelize.Op
const dateController = require('./dates.controller')
const site_data = require('../controllers/site_data.controller')
const projectController = require('../controllers/project.controller')

module.exports = {
  captureData,
  displayData
}
async function displayData(req, res) {
  // let data = await db.scheduledImp.findAll({
  //   where: {
  //     cft_id: req.params.teamID
  //   }
  // })
  let today = dateController.today()
  let startDate = dateController.moment(today).endOf('day').subtract(31, 'days').format()
  let endDate = dateController.moment(today).endOf('day').subtract(1, 'days').format()
  let data = await getProjectIds(req.params.teamID, startDate, endDate)
  let projectCount = data.projectData.length
  let number_of_locations = data.number_of_locations
  let duration1 = calcDuration(data.projectData, 1)
  let duration2 = calcDuration(data.projectData, 2)
  let captureDate = dateController.today()
  res.json({ projectCount, number_of_locations, duration1, duration2, captureDate, data })
}
async function captureData(req, res) {
  if (req) {
    res.send(200)
  }
  let today = dateController.today()
  let startDate = dateController.moment(today).endOf('day').subtract(31, 'days').format()
  let endDate = dateController.moment(today).endOf('day').subtract(1, 'days').format()
  let teams = await Teamcontroller.noAssociatedTeam()
  for (let i = 0; i < teams.length; i++) {
    try {
      let team = teams[i]
      let cft_id = team.id
      let data = await getProjectIds(team.id, startDate, endDate)
      let projectCount = data.projectData.length
      let number_of_locations = data.number_of_locations
      let duration1 = calcDuration(data.projectData, 1)
      let duration2 = calcDuration(data.projectData, 2)
      let captureDate = dateController.today()
      await db.scheduledImp.create({ cft_id, projectCount, number_of_locations, duration1, duration2, captureDate })
    } catch (e) {
      console.error(e)
    }
  }
}
async function getProjectIds(teamID, startDate, endDate) {
  let projectArray = []
  let projects = await db.lp_project.findAll({
    where: {
      cft_id: teamID
    },
    include: [
      {
        model: db.treeitem,
        where: {
          child_type: 'milestone',
          name: {
            [Op.like]: 'Website(s) Live%'
          },
          [Op.or]: [{ date_done: { [Op.between]: [startDate, endDate] } }, { date_done: null }]
        }
      }
    ]
  })
  for (let i = 0; i < projects.length; i++) {
    let project = projects[i]
    if (project.treeitems.length === 1) {
      projectArray.push(project.id)
    } else {
      // figure out if there 
      let milestones = await db.treeitem.findAll({
        where: {
          project_id: project.id,
          name: {
            [Op.like]: 'Website(s) Live%'
          }
        }
      })
      let passing = true
      milestones.forEach(milestone => {
        if (milestone.date_done == null) {
          passing = false
        }
      })
      if (passing) {
        projectArray.push(project.id)
      }
    }
  }
  // verify that other milstones are present
  let projectData = await verifyProjects(projectArray)
  let number_of_locations = await projectController.locationCount(projectArray)
  return { projectData, number_of_locations }
}
async function verifyProjects(projectArray) {
  let projectData = []
  let projects = await db.lp_project.findAll({
    where: {
      id: {
        [Op.in]: projectArray
      }
    },
    include: [
      {
        model: db.treeitem,
        where: {
          name: {
            [Op.or]: [{ [Op.like]: 'Implementation Start' }, { [Op.like]: 'Staging Links Delivered%' }, { [Op.like]: 'Website(s) Live%' }]
          },
          child_type: 'milestone'
        }
      }
    ]
  })
  projects.forEach(project => {
    let passing = true
    var data = {
      projectId: project.id,
      impStart: null,
      stgLink: null,
      websiteLive: null,
      complete: true
    }
    
    project.treeitems.forEach(milestone => {
      if (milestone.name.includes('Implementation Start')) {
        if (data.impStart == null) {
          data.impStart = milestone.date_done
        } else {
          if (milestone.data_done > data.impStart) {
            data.impStart = milestone.date_done
          }
        }
      }
      if (milestone.name.includes('Staging Links Delivered')) {
        if (data.stgLink == null) {
          data.stgLink = milestone.date_done
        } else {
          if (milestone.data_done > data.stgLink) {
            data.stgLink = milestone.date_done
          }
        }
      }
      if (milestone.name.includes('Website(s) Live')) {
        if (milestone.date_done == null) {
          data.complete = false
        }
        if (data.websiteLive == null) {
          data.websiteLive = milestone.date_done
        } else {
          if (milestone.data_done > data.websiteLive) {
            data.websiteLive = milestone.date_done
          }
        }
      }
    })
    if (data.impStart == null) {
      passing = false
    }
    if (passing) {
      projectData.push(data)
    }
    if (!data.complete) {
      data.websiteLive = null
    }
  })
  return projectData
}

function calcDuration(projectData, durationNumber) {
  let durationNumbers = []
  projectData.forEach(project => {
    if (project.complete) {
      if (durationNumber == 1) {
        durationNumbers.push(dateController.bussinessDaysBetween(project.websiteLive, project.impStart))
      } else if (durationNumber == 2) {
        durationNumbers.push(dateController.bussinessDaysBetween(project.stgLink, project.impStart))
      }
    }
  })
  let duration = 0
  durationNumbers.forEach(number => {
    duration += number
  })
  return duration
}
