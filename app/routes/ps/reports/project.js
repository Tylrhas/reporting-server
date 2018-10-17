var express = require('express')
var app = express()

var Sequelize = require("sequelize")
const Op = Sequelize.Op
//Models
var db = require("../../../models")
var moment = require('moment');
var teamMrr = require('../../../lib/reports/team_mrr')
var cfts = require('../../../lib/reports/cft')
var ps_project_report_dir = '/ps/reports/projects'
var page_data = require('../../../lib/page_links')
var scheduledimplementation = require('../../../lib/reports/scheduled_imp')


module.exports = function (app, passport) {
 app.get(ps_project_report_dir + '/active', checkAuthentication, function (req, res) {
  let link_data = page_data()
  var d = new Date();
  var date = {
   month: d.getMonth() + 1,
   year: d.getFullYear()
  }
  var projectType = ['Add Location', 'New', 'Migration', 'Transfer', 'Enh - General Enhancement', 'Enh - Branded Name Change', 'Internal Project', 'Corporate Only', 'Redesign']
  var package = ['Essential', 'Elite', 'Add - Existing Design', 'Expanded', 'Proven Path', 'New Package (combination)', 'Streamlined (retired)']
  let cft = db.cft.findAll({
   attributes: ['name']
  })
  let projects = db.lp_project.findAll({
   attributes: ['expected_finish', 'id', 'package', 'project_type', 'ps_phase'],
   where: {
    is_done: false,
    is_archived: false,
    is_on_hold: false,
    expected_finish: {
     [Op.not]: null
    }
   },
   include: [
    {
     attributes: ['id', 'name'],
     model: db.treeitem,
     where: {
      child_type: 'project'
     }
    },
    {
     attributes: ['name'],
     model: db.cft,
    },
    {
     attributes: ['total_mrr', 'estimated_go_live', 'actual_go_live'],
     model: db.lbs,
    }
   ]
  })
  Promise.all([cft, projects])
   .then(results => {
    console.log(results)
    for (i = 0; i < results[1].length; i++) {
     // calculate the activated and unactivated MRR
     if (results[1][i].hasOwnProperty('lbs')) {
      results[1][i].activatedMRR = 0
      results[1][i].unactivatedMRR = 0
      results[1][i].activationDate = null
      results[1][i].estimatedGolive = null
      for (lbsi = 0; lbsi < results[1][i].lbs.length; lbsi++) {
       let lbs = results[1][i].lbs[lbsi]
       if (lbs.actual_go_live != null) {
        // activated MRR
        results[1][i].activatedMRR = results[1][i].activatedMRR + lbs.total_mrr
        results[1][i].activationDate = checkActivationDate(results[1][i].activationDate, lbs.actual_go_live)
        results[1][i].estimatedGolive = checkEstimatedGoLiveDate(results[1][i].estimatedGolive, lbs.estimated_go_live)
       } else {
        // unactivated MRR
        results[1][i].unactivatedMRR = results[1][i].unactivatedMRR + lbs.total_mrr
        results[1][i].activationDate = checkActivationDate(results[1][i].activationDate, lbs.actual_go_live)
        results[1][i].estimatedGolive = checkEstimatedGoLiveDate(results[1][i].estimatedGolive, lbs.estimated_go_live)
       }
      }
      // get the oldest go-live date and the furtheset away estimated - go-live date

     }
    }
    // send over the projects lp_space_id to create links on page and moment to change the date 
    res.render('pages/active_projects', { user: req.user, projects: results[1], cfts: results[0], projectType: projectType, package: package, lp_space_id: process.env.LPWorkspaceId, moment: moment, slug: 'active-projects', link_data: link_data });
   })
 })
 app.get(ps_project_report_dir + '/coco/timeline', checkAuthentication, async function (req, res) {
  // find all projects that are active for a given team
  var todaysDate = new Date()
  let link_data = page_data()
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
    let datedif = moment(seoChecklist).diff(impReady, 'days')
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
    let datedif = moment(buildReady).diff(seoChecklist, 'days')
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
    let datedif = moment(copySolution).diff(seoChecklist, 'days')
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
    let datedif = moment(buildReady).diff(copySolution, 'days')
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
    let datedif = moment(peerReview).diff(buildReady, 'days')
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
    let datedif = moment(seoStaging).diff(peerReview, 'days')
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
    let datedif = moment(pmRevew).diff(seoStaging, 'days')
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
    let datedif = moment(stagingQC).diff(pmRevew, 'days')
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
    let datedif = moment(linksDelivered).diff(stagingQC, 'days')
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
  res.render('pages/ps/reports/team-timeline', { user: req.user, lp_space_id: process.env.LPWorkspaceId, moment: moment, slug: 'coco-timeline', link_data: link_data, averageTime: averageTime });
 })
 app.get(ps_project_report_dir + '/scheduledimplementation', async function (req, res) {
  let queue = await scheduledimplementation.getQueue()
  let link_data = page_data()
  // res.render('pages/ps/reports/team-timeline', { user: req.user, lp_space_id: process.env.LPWorkspaceId, moment: moment, slug: 'coco-timeline', link_data: link_data, averageTime: averageTime });
  res.json(queue)
 })
 function getSum(total, num) {
  return total + num;
 }
 function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
   // if user is looged in, req.isAuthenticated() will return true
   next()
  } else {
   res.redirect('/g5_auth/users/auth/g5')
  }
 }
}

function checkActivationDate(activationDate, actual_go_live) {
 if (activationDate == null && actual_go_live != null) {
  return actual_go_live
 } else if (activationDate != null && actual_go_live != null && moment(actual_go_live).isBefore(activationDate)) {
  return actual_go_live
 } else {
  return activationDate
 }
}

function checkEstimatedGoLiveDate(estimatedGolive, estimated_go_live) {
 if (estimatedGolive == null && estimated_go_live != null) {
  return estimated_go_live
 } else if (estimatedGolive != null && estimated_go_live != null && moment(estimated_go_live).isAfter(estimatedGolive)) {
  return estimated_go_live
 } else {
  return estimatedGolive
 }
}