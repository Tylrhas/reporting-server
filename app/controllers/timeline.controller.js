const db = require('../models')
const Op = db.Sequelize.Op
const dates = require('./dates.controller')
const site_data = require('./site_data.controller')
const team = require('./team.controller')
module.exports = {
  timeline,
  detail,
  dashboard
}

async function dashboard (req, res) {
  let teams = await team.noAssociatedTeam()
  res.render('pages/ps/reports/milestone_cards', {user: req.user, lp_space_id: process.env.LPWorkspaceId, slug: 'timeline', site_data: site_data.all(), cards: teams})
}

async function timeline(req, res) {
  let teamID = req.params.teamid
  // find all projects that are active for a given team
  var todaysDate = dates.today()
  let taskTimes = await taskTimeline(teamID, todaysDate)
  let milestoneTimes = await milestoneTimeline(teamID, todaysDate)
  milestoneTimes.name = 'Milestones'
  taskTimes.name = 'Tasks'
  let teamName = await db.cft.findOne({
    attributtes: ['name'],
    where: {
      id: teamID
    }
  })
  let averageTime = {
    milestoneTimes,
    taskTimes
  }
  
  res.render('pages/ps/reports/team-timeline', { user: req.user, lp_space_id: process.env.LPWorkspaceId, slug: 'timeline', site_data: site_data.all(), averageTime: averageTime, teamName: teamName.name, teamID, teamID })
}
async function detail(req, res) {
  let teamID = req.params.teamid
  let projects = await getMilestones(teamID)
  let milestoneGroups = groupMilestones(projects)
  let teamName = await db.cft.findOne({
    attributtes: ['name'],
    where: {
      id: teamID
    }
  })
  res.render('pages/ps/reports/team-timeline-detail', { user: req.user, lp_space_id: process.env.LPWorkspaceId, slug: 'timeline', site_data: site_data.all(), averageTime: milestoneGroups, teamName: teamName.name })
}

function getSum(total, num) {
  return total + num;
}
async function milestoneTimeline(teamID, todaysDate) {
  let projects = await getMilestones(teamID)

  let milestoneData = {
    averages: {
      milestone1: {
        name: 'Contract Execution to Implementation Ready',
        value: []
      },
      milestone2: {
        name: 'Implementation Ready to Implementation Start',
        value: []
      },
      milestone3: {
        name: 'Implementation Start to Build Ready',
        value: []
      },
      milestone4: {
        name: 'Build Ready to Staging Links Delivered',
        value: []
      },
      milestone5: {
        name: 'Staging Links Delivered to Services Activated',
        value: []
      },
      milestone6: {
        name: 'Staging Links Delivered to Launch Approval',
        value: []
      },
      milestone7: {
        name: 'Services Activated to Website(s) Live',
        value: []
      },
      milestone8: {
        name: 'Website(s) Live to Project Closed',
        value: []
      }
    },
    totalMilestones: 0,
    totalRejectedProjects: 0,
    rejectedProjects: []
  }

  projects.forEach(project => {
    let milestones = {
      contractExecution: null,
      impReady: null,
      impStart: null,
      buildReady: null,
      stgLinksDel: null,
      clientApproval: null,
      launchApproval: null,
      websitesLive: null,
      servsActivated: null,
      projectClosed: null
    }
    project.treeitems.forEach(milestone => {
      let milestoneName = milestone.name
      if (milestoneName.includes('Contract Execution')) {
        milestones.contractExecution = milestone.date_done
      } else if (milestoneName.includes('Implementation Ready')) {
        milestones.impReady = milestone.date_done
      } else if (milestoneName.includes('Implementation Start')) {
        milestones.impStart = milestone.date_done
      } else if (milestoneName.includes('Build Ready')) {
        milestones.buildReady = milestone.date_done
      } else if (milestoneName.includes('Staging Links Delivered')) {
        // if there is more than one staging links delivered get the latest date
        milestones.stgLinksDel = milestone.date_done
      } else if (milestoneName.includes('Launch Approval')) {
        milestones.launchApproval = milestone.date_done
      } else if (milestoneName.includes('Website(s) Live')) {
        milestones.websitesLive = milestone.date_done
      } else if (milestoneName.includes('Services Activated')) {
        milestones.servsActivated = milestone.date_done
      } else if (milestoneName.includes('Project Closed')) {
        milestones.projectClosed = milestone.date_done
      }
    })
    milestoneData = buildAverageTimes(milestones, project, milestoneData)
  })
  Object.entries(milestoneData.averages).forEach(data => {
    if (data[0].includes('milestone')) {
      milestoneData.averages[data[0]].value = average(data[1].value)
    }
  })
  return milestoneData
}
function buildAverageTimes(milestones, project, milestoneData) {
  let project_id = project.id

  if (milestones.contractExecution && milestones.impReady) {
    milestoneData.totalMilestones++
    let datedif = dates.bussinessDaysBetween(milestones.impReady, milestones.contractExecution)
    if (datedif <= 0) {
      milestoneData.totalRejectedProjects++
      milestoneData.rejectedProjects.push({ project_id: project_id, milestone: milestoneData.averages.milestone1.name, days: datedif })
    } else {
      milestoneData.averages.milestone1.value.push(datedif)
    }
  }
  if (milestones.impReady && milestones.impStart) {
    milestoneData.totalMilestones++
    let datedif = dates.bussinessDaysBetween(milestones.impStart, milestones.impReady)
    if (datedif < 0) {
      milestoneData.totalRejectedProjects++
      milestoneData.rejectedProjects.push({ project_id: project_id, milestone: milestoneData.averages.milestone2.name, days: datedif })
    } else {
      milestoneData.averages.milestone2.value.push(datedif)
    }
  }
  if (milestones.impStart && milestones.buildReady) {
    milestoneData.totalMilestones++
    let datedif = dates.bussinessDaysBetween(milestones.buildReady, milestones.impStart)
    if (datedif <= 0) {
      milestoneData.totalRejectedProjects++
      milestoneData.rejectedProjects.push({ project_id: project_id, milestone: milestoneData.averages.milestone3.name, days: datedif })
    } else {
      milestoneData.averages.milestone3.value.push(datedif)
    }
  }
  if (milestones.buildReady && milestones.stgLinksDel) {
    milestoneData.totalMilestones++
    let datedif = dates.bussinessDaysBetween(milestones.stgLinksDel, milestones.buildReady)
    if (datedif <= 0) {
      milestoneData.totalRejectedProjects++
      milestoneData.rejectedProjects.push({ project_id: project_id, milestone: milestoneData.averages.milestone4.name, days: datedif })
    } else {
      milestoneData.averages.milestone4.value.push(datedif)
    }
  }
  if (milestones.stgLinksDel && milestones.servsActivated) {
    milestoneData.totalMilestones++
    let datedif = dates.bussinessDaysBetween(milestones.servsActivated, milestones.stgLinksDel)
    if (datedif <= 0) {
      milestoneData.totalRejectedProjects++
      milestoneData.rejectedProjects.push({ project_id: project_id, milestone: milestoneData.averages.milestone5.name, days: datedif })
    } else {
      milestoneData.averages.milestone5.value.push(datedif)
    }
  }
  if (milestones.stgLinksDel && milestones.launchApproval) {
    milestoneData.totalMilestones++
    let datedif = dates.bussinessDaysBetween(milestones.launchApproval, milestones.stgLinksDel)
    if (datedif <= 0) {
      milestoneData.totalRejectedProjects++
      milestoneData.rejectedProjects.push({ project_id: project_id, milestone: milestoneData.averages.milestone6.name, days: datedif })
    } else {
      milestoneData.averages.milestone6.value.push(datedif)
    }
  }
  if (milestones.launchApproval && milestones.websitesLive) {
    milestoneData.totalMilestones++
    let datedif = dates.bussinessDaysBetween(milestones.websitesLive, milestones.launchApproval)
    if (datedif < 0) {
      milestoneData.totalRejectedProjects++
      milestoneData.rejectedProjects.push({ project_id: project_id, milestone: milestoneData.averages.milestone7.name, days: datedif })
    } else {
      milestoneData.averages.milestone7.value.push(datedif)
    }
  }
  if (milestones.websitesLive && milestones.projectClosed) {
    milestoneData.totalMilestones++
    let datedif = dates.bussinessDaysBetween(milestones.projectClosed, milestones.websitesLive)
    if (datedif <= 0) {
      milestoneData.totalRejectedProjects++
      milestoneData.rejectedProjects.push({ project_id: project_id, milestone: milestoneData.averages.milestone8.name, days: datedif })
    } else {
      milestoneData.averages.milestone8.value.push(datedif)
    }
  }
  return milestoneData
}
async function taskTimeline(teamID, todaysDate) {

  let projects = await db.lp_project.findAll({
    where: {
      is_done: false,
      is_archived: false,
      cft_id: teamID
    },
    include: [
      {
        model: db.treeitem,
        where: {
          name: {
            [Op.or]: [{ [Op.like]: '%Implementation Ready%' }, { [Op.like]: '%SEO Checklist Review%' }, { [Op.like]: 'Copy Solution Phase%' }, { [Op.like]: '%Build Ready' }, { [Op.like]: 'Peer Review%' }, { [Op.like]: '%SEO Staging Review%' }, { [Op.like]: 'PM Review%' }, { [Op.like]: '%Staging Quality Control%' }, { [Op.like]: '%Staging Links Delivered%' }]
          },
          child_type: {
            [Op.in]: ['task', 'milestone']
          }
        }
      }
    ]
  })
  let averageTime = {
    milestone1: {
      name: 'Implementation Ready to SEO Checklist (SEO Review)',
      value: []
    },
    milestone2: {
      name: 'SEO Checklist to Build Ready (Copy and Build Prep)',
      value: []
    },
    milestone3: {
      name: 'SEO Checklist to Copy Solution (Copy Solution)',
      value: []
    },
    milestone4: {
      name: 'Copy Solution to Build Ready (Build Prep)',
      value: []
    },
    milestone5: {
      name: 'Build Ready to Peer Review (Build)',
      value: []
    },
    milestone6: {
      name: 'Peer Review to SEO Staging (SEO Staging)',
      value: []
    },
    milestone7: {
      name: 'SEO Staging to PM Review (PM Review)',
      value: []
    },
    milestone8: {
      name: 'PM Review to Staging QC (Staging QC)',
      value: []
    },
    milestone9: {
      name: 'Staging QC to Links Delivered (Links Delivered)',
      value: []
    },
  }
  var milestones = {
    total: 0,
    rejected: 0
  }
  var rejectedProjects = []
  for (i = 0; i < projects.length; i++) {
    var project = projects[i].dataValues.treeitems
    var impReady = null
    var seoChecklist = null
    var copySolution = null
    var buildReady = null
    var peerReview = null
    var seoStaging = null
    var pmRevew = null
    var stagingQC = null
    var linksDelivered = null
    for (pi = 0; pi < project.length; pi++) {
      var project_name = project[pi].name
      if (project_name.includes('Implementation Ready')) {
        impReady = project[pi].date_done
      } else if (project_name.includes('SEO Checklist')) {
        seoChecklist = project[pi].date_done
      } else if (project_name.includes('Copy Solution')) {
        copySolution = project[pi].date_done
      } else if (project_name.includes('Build Ready')) {
        buildReady = project[pi].date_done
      } else if (project_name.includes('Peer Review')) {
        peerReview = project[pi].date_done
      } else if (project_name.includes('SEO Staging Review')) {
        seoStaging = project[pi].date_done
      } else if (project_name.includes('PM Review')) {
        pmRevew = project[pi].date_done
      } else if (project_name.includes('Staging Quality Control')) {
        stagingQC = project[pi].date_done
      } else if (project_name.includes('Staging Links Delivered')) {
        linksDelivered = project[pi].date_done
      } else {
        // name does not match what we are looking for
      }
    }
    if (impReady && seoChecklist) {
      milestones.total++
      let datedif = dates.bussinessDaysBetween(seoChecklist, impReady)
      if (datedif < 0) {
        milestones.rejected++
        rejectedProjects.push({ project_id: projects[i].id, milestone: averageTime.milestone1.name, days: datedif })
        console.log(projects[i].id)
      } else {
        averageTime.milestone1.value.push(datedif);
      }
    }
    if (seoChecklist && buildReady) {
      milestones.total++
      let datedif = dates.bussinessDaysBetween(buildReady, seoChecklist)
      if (datedif < 0) {
        milestones.rejected++
        rejectedProjects.push({ project_id: projects[i].id, milestone: averageTime.milestone2.name, days: datedif })
        console.log(projects[i].id)
      } else {
        averageTime.milestone2.value.push(datedif);
      }
    }
    if (seoChecklist && copySolution) {
      milestones.total++
      let datedif = dates.bussinessDaysBetween(copySolution, seoChecklist)
      if (datedif < 0) {
        milestones.rejected++
        rejectedProjects.push({ project_id: projects[i].id, milestone: averageTime.milestone3.name, days: datedif })
        console.log(projects[i].id)
      } else {
        averageTime.milestone3.value.push(datedif);
      }
    }
    if (copySolution && buildReady) {
      milestones.total++
      let datedif = dates.bussinessDaysBetween(buildReady, copySolution)
      if (datedif < 0) {
        milestones.rejected++
        rejectedProjects.push({ project_id: projects[i].id, milestone: averageTime.milestone4.name, days: datedif })
        console.log(projects[i].id)
      } else {
        averageTime.milestone4.value.push(datedif);
      }
    }
    if (buildReady && peerReview) {
      milestones.total++
      let datedif = dates.bussinessDaysBetween(peerReview, buildReady)
      if (datedif < 0) {
        milestones.rejected++
        rejectedProjects.push({ project_id: projects[i].id, milestone: averageTime.milestone5.name, days: datedif })
        console.log(projects[i].id)
      } else {
        averageTime.milestone5.value.push(datedif);
      }
    }
    if (peerReview && seoStaging) {
      milestones.total++
      let datedif = dates.bussinessDaysBetween(seoStaging, peerReview)
      if (datedif < 0) {
        milestones.rejected++
        rejectedProjects.push({ project_id: projects[i].id, milestone: 'Peer Review to SEO Staging (SEO Staging)', days: datedif })
        console.log(projects[i].id)
      } else {
        averageTime.milestone6.value.push(datedif);
      }
    }
    if (seoStaging && pmRevew) {
      milestones.total++
      let datedif = dates.bussinessDaysBetween(pmRevew, seoStaging)
      if (datedif < 0) {
        milestones.rejected++
        rejectedProjects.push({ project_id: projects[i].id, milestone: averageTime.milestone7.name, days: datedif })
        console.log(projects[i].id)
      } else {
        averageTime.milestone7.value.push(datedif);
      }
    }
    if (pmRevew && stagingQC) {
      milestones.total++
      let datedif = dates.bussinessDaysBetween(stagingQC, pmRevew)
      if (datedif < 0) {
        milestones.rejected++
        rejectedProjects.push({ project_id: projects[i].id, milestone: averageTime.milestone8.name, days: datedif })
        console.log(projects[i].id)
      } else {
        averageTime.milestone8.value.push(datedif);
      }
    }
    if (stagingQC && linksDelivered) {
      milestones.total++
      let datedif = dates.bussinessDaysBetween(linksDelivered, stagingQC)
      if (datedif < 0) {
        milestones.rejected++
        rejectedProjects.push({ project_id: projects[i].id, milestone: averageTime.milestone9.name, days: datedif })
        console.log(projects[i].id)
      } else {
        averageTime.milestone9.value.push(datedif);
      }
    }
  }
  console.log('averageTime')
  // average each phase time
  averageTime = {
    averages: averageTime,
    totalMilestones: milestones.total,
    totalRejectedProjects: milestones.rejected,
    rejectedProjects: rejectedProjects
  }
  Object.entries(averageTime.averages).forEach(data => {
    if (data[0].includes('milestone')) {
      averageTime.averages[data[0]].value = average(data[1].value)
    }
  })
  return averageTime
}
function getMilestones(teamID) {
  return db.lp_project.findAll({
    where: {
      is_done: false,
      is_archived: false,
      cft_id: teamID
    },
    include: [
      {
        model: db.treeitem,
        where: {
          name: {
            [Op.or]: [{ [Op.like]: 'Contract Execution' }, { [Op.like]: 'Implementation Ready' }, { [Op.like]: 'Implementation Start' }, { [Op.iLike]: '%Build Ready%' }, { [Op.like]: 'Staging Links Delivered%' }, { [Op.like]: 'Launch Approval%' }, { [Op.like]: 'Website(s) Live%' }, { [Op.like]: 'Services Activated%' }, { [Op.like]: 'Project Closed%' }]
          },
          date_done: {
            [Op.not]: null
          },
          child_type: 'milestone'
        }
      }
    ]
  })
}
function groupMilestones(projects) {

  let milestones = [
    {
      name: 'Contract Execution to Implementation Ready',
      values: []
    },
    {
      name: 'Implementation Ready to Implementation Start',
      values: []
    },
    {
      name: 'Implementation Start to Build Ready',
      values: []
    },
    {
      name: 'Build Ready to Staging Links Delivered',
      values: []
    },
    {
      name: 'Staging Links Delivered to Services Activated',
      values: []
    },
    {
      name: 'Staging Links Delivered to Launch Approval',
      values: []
    },
    {
      name: 'Services Activated to Website(s) Live',
      values: []
    },
    {
      name: 'Website(s) Live to Project Closed',
      values: []
    }
  ]
  projects.forEach(project => {
    let projectMilestones = findMilestones(project)
    projectMilestones.project_id = project.id
    milestones = pushProjectMilestones(projectMilestones, milestones)
  })
  return milestones
}
function pushProjectMilestones (projectMilestones, milestones) {
  if (projectMilestones.contractExecution && projectMilestones.impReady) {
    let datedif = dates.bussinessDaysBetween(projectMilestones.impReady, projectMilestones.contractExecution)
    if (datedif > 0) {
      milestones[0].values.push({projectID: projectMilestones.project_id, days: datedif })
    }
  }
  if (projectMilestones.impReady && projectMilestones.impStart) {
    let datedif = dates.bussinessDaysBetween(projectMilestones.impStart, projectMilestones.impReady)
    if (datedif > 0) {
    milestones[1].values.push({projectID: projectMilestones.project_id, days: datedif})
    }
  }
  if (projectMilestones.impStart && projectMilestones.buildReady) {
    let datedif = dates.bussinessDaysBetween(projectMilestones.buildReady, projectMilestones.impStart)
    if (datedif > 0) {
    milestones[2].values.push({projectID: projectMilestones.project_id, days: datedif})
    }
  }
  if (projectMilestones.buildReady && projectMilestones.stgLinksDel) {
    let datedif = dates.bussinessDaysBetween(projectMilestones.stgLinksDel, projectMilestones.buildReady)
    if (datedif > 0) {
    milestones[3].values.push({projectID: projectMilestones.project_id, days: datedif})
    }
  }
  if (projectMilestones.stgLinksDel && projectMilestones.servsActivated) {
    let datedif = dates.bussinessDaysBetween(projectMilestones.servsActivated, projectMilestones.stgLinksDel)
    if (datedif > 0) {
    milestones[4].values.push({projectID: projectMilestones.project_id, days: datedif})
    }
  }
  if (projectMilestones.stgLinksDel && projectMilestones.launchApproval) {
    let datedif = dates.bussinessDaysBetween(projectMilestones.launchApproval, projectMilestones.stgLinksDel)
    if (datedif > 0) {
    milestones[5].values.push({projectID: projectMilestones.project_id, days: datedif})
    }
  }
  if (projectMilestones.servsActivated && projectMilestones.websitesLive) {
    let datedif = dates.bussinessDaysBetween(projectMilestones.websitesLive, projectMilestones.servsActivated)
    if (datedif > 0) {
    milestones[6].values.push({projectID: projectMilestones.project_id, days: datedif})
    }
  }
  if (projectMilestones.websitesLive && projectMilestones.projectClosed) {
    let datedif = dates.bussinessDaysBetween(projectMilestones.projectClosed, projectMilestones.websitesLive)
    if (datedif > 0) {
    milestones[7].values.push({projectID: projectMilestones.project_id, days: datedif})
    }
  }

  return milestones
}
function findMilestones(project, ) {
  let milestones = {
    contractExecution: null,
    impReady: null,
    impStart: null,
    buildReady: null,
    stgLinksDel: null,
    launchApproval: null,
    websitesLive: null,
    servsActivated: null,
    projectClosed: null
  }
  project.treeitems.forEach(milestone => {
    milestoneName = milestone.name
    if (milestoneName.includes('Contract Execution')) {
      milestones.contractExecution = milestone.date_done
    } else if (milestoneName.includes('Implementation Ready')) {
      milestones.impReady = milestone.date_done
    } else if (milestoneName.includes('Implementation Start')) {
      milestones.impStart = milestone.date_done
    } else if (milestoneName.includes('Build Ready')) {
      milestones.buildReady = milestone.date_done
    } else if (milestoneName.includes('Staging Links Delivered')) {
      // if there is more than one staging links delivered get the latest date
      if (milestones.stgLinksDel != null && milestones.stgLinksDel < milestone.date_done) {
        milestones.stgLinksDel = milestone.date_done
      } else if (milestones.stgLinksDel == null) {
        milestones.stgLinksDel = milestone.date_done
      }
    } else if (milestoneName.includes('Launch Approval')) {
      milestones.launchApproval = milestone.date_done
    } else if (milestoneName.includes('Website(s) Live')) {
      milestones.websitesLive = milestone.date_done
    } else if (milestoneName.includes('Services Activated')) {
      milestones.servsActivated = milestone.date_done
    } else if (milestoneName.includes('Project Closed')) {
      milestones.projectClosed = milestone.date_done
    }
  })

  return milestones
}
function average(numbers) {
  var sum = 0;
  numbers.forEach(number => {
    sum += number
  })

  var avg = sum / numbers.length;

  return site_data.roundNumber(avg,2)
}