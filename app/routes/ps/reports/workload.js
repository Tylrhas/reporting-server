const auth = require('../../../controllers/auth.controller')
const workloadController = require('../../../controllers/workload.controller')
// set the sub dirs for the PS MRR Reporting Routes
var psWorkloadPath = '/ps/reports/workload'
module.exports = function (app, passport) {
//  app.get(`${psWorkloadPath}/`, auth.basic,  workloadController.dashboard )
 app.get(`${psWorkloadPath}/cft`, auth.basic, workloadController.cftDashboard )
 app.get(`${psWorkloadPath}/cft/:teamID/active`, auth.basic , workloadController.teamActiveProjects)
 app.get(`${psWorkloadPath}/cft/:teamID/scheduled`, auth.basic , workloadController.teamScheduledProjects)
 app.get(`${psWorkloadPath}/cft/:teamID/projects`, auth.basic , workloadController.allProjects)
}