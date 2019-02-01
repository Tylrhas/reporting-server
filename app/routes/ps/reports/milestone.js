timelineController = require('../../../controllers/timeline.controller')
const auth = require('../../../controllers/auth.controller')
const ps_milestone_report_dir = '/ps/reports/milestones'

module.exports = function (app, passport) {
  app.get(`${ps_milestone_report_dir}/timeline`, auth.basic, timelineController.dashboard) 
  app.get(`${ps_milestone_report_dir}/timeline/:teamid`, auth.basic, timelineController.timeline)
  app.get(`${ps_milestone_report_dir}/timeline/:teamid/detail`, timelineController.detail)
  app.get(`${ps_milestone_report_dir}/archived/timeline`, auth.basic, timelineController.dashboard) 
  app.get(`${ps_milestone_report_dir}/archived/timeline/:teamid`, auth.basic, timelineController.historicalTimeline)
  app.get(`${ps_milestone_report_dir}/archived/timeline/:teamid/detail`, timelineController.historicalTimelineDetail)
}