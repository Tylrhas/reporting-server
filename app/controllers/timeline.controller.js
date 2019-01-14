const db = require('../models')
const Op = db.Sequelize.Op
const dates = require('./dates.controller')
const site_data = require('./site_data.controller')
module.exports = {
  elCocoLocoTimeline
}

async function elCocoLocoTimeline(req, res) {
// find all projects that are active for a given team
var todaysDate = dates.today()
let projects = await db.lp_project.findAll({
  where: {
    is_done: false,
    is_archived: false,
    cft_id: 44790301
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
var averageTime = {
  milestone1: [],
  milestone2: [],
  milestone3: [],
  milestone4: [],
  milestone5: [],
  milestone6: [],
  milestone7: [],
  milestone8: [],
  milestone9: []
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
      rejectedProjects.push({ project_id: projects[i].id, milestone: 'Implementation to SEO Checklist (SEO Review)', days: datedif })
      console.log(projects[i].id)
    } else {
      averageTime.milestone1.push(datedif);
    }
  }
  if (seoChecklist && buildReady) {
    milestones.total++
    let datedif = dates.bussinessDaysBetween(buildReady, seoChecklist)
    if (datedif < 0) {
      milestones.rejected++
      rejectedProjects.push({ project_id: projects[i].id, milestone: 'SEO Checklist to Build Ready (Copy and Build Prep)', days: datedif })
      console.log(projects[i].id)
    } else {
      averageTime.milestone2.push(datedif);
    }
  }
  if (seoChecklist && copySolution) {
    milestones.total++
    let datedif = dates.bussinessDaysBetween(copySolution, seoChecklist)
    if (datedif < 0) {
      milestones.rejected++
      rejectedProjects.push({ project_id: projects[i].id, milestone: 'SEO Checklist to Copy Solution (Copy)', days: datedif })
      console.log(projects[i].id)
    } else {
      averageTime.milestone3.push(datedif);
    }
  }
  if (copySolution && buildReady) {
    milestones.total++
    let datedif = dates.bussinessDaysBetween(buildReady, copySolution)
    if (datedif < 0) {
      milestones.rejected++
      rejectedProjects.push({ project_id: projects[i].id, milestone: 'Copy Solution to Build Ready (Build Prep)', days: datedif })
      console.log(projects[i].id)
    } else {
      averageTime.milestone4.push(datedif);
    }
  }
  if (buildReady && peerReview) {
    milestones.total++
    let datedif = dates.bussinessDaysBetween(peerReview, buildReady)
    if (datedif < 0) {
      milestones.rejected++
      rejectedProjects.push({ project_id: projects[i].id, milestone: 'Build Ready to Peer Review (Build)', days: datedif })
      console.log(projects[i].id)
    } else {
      averageTime.milestone5.push(datedif);
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
      averageTime.milestone6.push(datedif);
    }
  }
  if (seoStaging && pmRevew) {
    milestones.total++
    let datedif = dates.bussinessDaysBetween(pmRevew, seoStaging)
    if (datedif < 0) {
      milestones.rejected++
      rejectedProjects.push({ project_id: projects[i].id, milestone: 'SEO Staging to PM Review (PM Review)', days: datedif })
      console.log(projects[i].id)
    } else {
      averageTime.milestone7.push(datedif);
    }
  }
  if (pmRevew && stagingQC) {
    milestones.total++
    let datedif = dates.bussinessDaysBetween(stagingQC, pmRevew)
    if (datedif < 0) {
      milestones.rejected++
      rejectedProjects.push({ project_id: projects[i].id, milestone: 'PM Review to Staging QC (Staging QC)', days: datedif })
      console.log(projects[i].id)
    } else {
      averageTime.milestone8.push(datedif);
    }
  }
  if (stagingQC && linksDelivered) {
    milestones.total++
    let datedif = dates.bussinessDaysBetween(linksDelivered, stagingQC)
    if (datedif < 0) {
      milestones.rejected++
      rejectedProjects.push({ project_id: projects[i].id, milestone: 'Staging QC to Links Delivered (Links Delivered)', days: datedif })
      console.log(projects[i].id)
    } else {
      averageTime.milestone9.push(datedif);
    }
  }
}
console.log('averageTime')
// average each phase time
for (i = 0; i < Object.keys(averageTime).length; i++) {
  var key = Object.keys(averageTime)[i]
  var array = averageTime[key]
  let average = array.reduce(getSum, 0) / array.length
  averageTime[key] = average
}
averageTime = {
  rejectedProjects: rejectedProjects,
  milestones: averageTime,
  milestoneMap: {
    milestone1: 'Implementation Ready to SEO Checklist (SEO Review)',
    milestone2: 'SEO Checklist to Build Ready (Copy and Build Prep)',
    milestone3: 'SEO Checklist to Copy Solution (Copy Solution)',
    milestone4: 'Copy Solution to Build Ready (Build Prep)',
    milestone5: 'Build Ready to Peer Review (Build)',
    milestone6: 'Peer Review to SEO Staging (SEO Staging)',
    milestone7: 'SEO Staging to PM Review (PM Review)',
    milestone8: 'PM Review to Staging QC (Staging QC)',
    milestone9: 'Staging QC to Links Delivered (Links Delivered)'
  },
  date: todaysDate,
  milestoneData: milestones
}
res.render('pages/ps/reports/team-timeline', { user: req.user, lp_space_id: process.env.LPWorkspaceId, slug: 'coco-timeline', site_data: site_data.all(), averageTime: averageTime });
}