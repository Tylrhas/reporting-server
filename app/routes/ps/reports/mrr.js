const auth = require('../../../controllers/auth.controller')
const psController = require('../../../controllers/ps.controller')
const ps_mrr_path = '/ps/reports/mrr'

module.exports = function (app, passport) {
   
    app.get(`${ps_mrr_path}/`, auth.basic, psController.yearDetailArchive)
    app.get(`${ps_mrr_path}/:year`, auth.basic, psController.yearDetails)
    app.get(`${ps_mrr_path}/:year/quarter/:quarter`, auth.basic, psController.quarterDetails)
    app.get(`${ps_mrr_path}/teams`, auth.basic, function (req, res) {
        var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        let link_data = page_data()
        let years = teamMrr.archive_years()
        res.render('pages/ps/reports/team_mrr_goal_archive', { user: req.user, slug: 'mrr', moment: moment, link_data: link_data, years: years, months: months });
    })
    app.get(`${ps_mrr_path}/teams/:year/:month`, auth.basic, psController.mrrDetailsDashboard)
    app.get(`${ps_mrr_path}/teams/:teamid/:year/:month`, auth.basic, psController.mrrDetailsTeam )
    app.get(`${ps_mrr_path}/teams/backlog/:teamid/:year/:month`, auth.basic, async function (req, res) {
        var id = parseInt(req.params.teamid)
        var month = parseInt(req.params.month)
        var year = parseInt(req.params.year)
        var lastDay = new Date(year, month, 0)
        let link_data = page_data(month, year)
        // get the backlog for the team
        let lbs = await teamMrr.team_backlog_detail(id, lastDay)
        let cftName = await db.cft.findAll({ where: { id: id } })
        res.render('pages/ps/reports/team_backlog', { user: req.user, lbs: lbs, slug: 'team_backlog', lp_space_id: process.env.LPWorkspaceId, moment: moment, link_data: link_data, cftName: cftName[0] });
    })
}