const db = require('../models')
const Teamcontroller = require('./team.controller')
const Op = db.Sequelize.Op
const dateController = require('./dates.controller')

module.exports = {
  captureData,
  displayData
}
async function displayData(req, res) {
  // let data = await db.scheduledImp.findAll({
  //   where: {
  //     cft_id: req.params.teamId
  //   }
  // })
  let today = dateController.today()
  let startDate = dateController.moment(today).endOf('day').subtract(8, 'days').format()
  let endDate = dateController.moment(today).endOf('day').subtract(1, 'days').format()
  res.json(await getProjectIds(req.params.teamID, startDate, endDate))
}
async function captureData() {
  let today = dateController.today()
  let startDate = dateController.moment(today).endOf('day').subtract(8, 'days')
  let endDate = dateController.moment(today).endOf('day').subtract(1, 'days')
  let teams = Teamcontroller.noAssociatedTeam()
  for (let i = 0; i < teams.length; i++) {
    let team = teams[i]
    let projectIds = await getProjectIds(team.id, startDate, endDate)
    //    Count project done in last 7 days 
    let projectCount = await projectCount(team.id)
    //    Count locations in those projects
    //    Average duration between imp start and stg links del
    //    Average duration between imp start and website(s) live
  }
}
async function getProjectIds(teamID, startDate, endDate) {
  let projectArray = []
  let projects = await db.lp_project.findAll({
    include: [
      {
        model: db.treeitem,
        where: {
          child_type: 'milestone',
          name: {
            [Op.like]: 'Website(s) Live%'
          },
          date_done: {
            [Op.between]: [startDate, endDate]
          }
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
  return projectData
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
          date_done: {
            [Op.not]: null
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
      websiteLive: null
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
        if (data.websiteLive == null) {
          data.websiteLive = milestone.date_done
        } else {
          if (milestone.data_done > data.websiteLive) {
            data.websiteLive = milestone.date_done
          }
        }
      }
    })
    if (data.stgLink == null || data.impStart == null || data.websiteLive == null) {
      passing = false
    }
    if (passing) {
      projectData.push(data)
    }
  })
  return projectData
}