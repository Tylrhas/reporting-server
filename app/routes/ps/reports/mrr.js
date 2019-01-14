const auth = require('../../../controllers/auth.controller')
const psController = require('../../../controllers/ps.controller')
const ps_mrr_path = '/ps/reports/mrr'

module.exports = function (app, passport) {
    app.get(`${ps_mrr_path}/`, auth.basic, psController.yearDetailArchive)
    app.get(`${ps_mrr_path}/teams`, auth.basic, psController.teamArchive)
    app.get(`${ps_mrr_path}/teams/:year/:month`, psController.mrrDetailsDashboard)
    app.get(`${ps_mrr_path}/teams/:teamid/:year/:month`, auth.basic, psController.teamActivatedDetails)
    app.get(`${ps_mrr_path}/teams/backlog/:teamid/:year/:month`, auth.basic, psController.teamBacklog)
    app.get(`${ps_mrr_path}/:year`, auth.basic, psController.yearDetails)
    app.get(`${ps_mrr_path}/:year/quarter/:quarter`, auth.basic, psController.quarterDetails)
}