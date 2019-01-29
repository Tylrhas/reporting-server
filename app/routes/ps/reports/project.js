timelineController = require('../../../controllers/timeline.controller')
const auth = require('../../../controllers/auth.controller')
const ps_project_report_dir = '/ps/reports/projects'

module.exports = function (app, passport) {
 app.get(ps_project_report_dir + '/coco/timeline', auth.basic, timelineController.elCocoLocoTimeline)
}