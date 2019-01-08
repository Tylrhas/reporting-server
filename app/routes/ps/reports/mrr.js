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
    app.get(`${ps_mrr_path}/teams/:year/:month`, auth.basic, function (req, res) {
        // get all LBS items launched this month and match to project and CFT and sum the totals for each team

        var month = parseInt(req.params.month)
        var year = parseInt(req.params.year)

        let link_data = page_data(month, year)
        var team_dashboard = reportController.team_quick_look(month, year)

        Promise.all([team_dashboard]).then(results => {
            res.render('pages/ps/reports/team_mrr', { user: req.user, teamMrr: results[0], link_data: link_data, slug: 'mrr', moment: moment });
        })
    })
    app.get(`${ps_mrr_path}/teams/:teamid/:year/:month`, auth.basic, function (req, res) {
        var id = parseInt(req.params.teamid)
        var month = parseInt(req.params.month)
        var year = parseInt(req.params.year)

        var firstDay = new Date(year, month - 1, 0);
        var lastDay = new Date(year, month, 0);
        var cft_name = db.cft.findAll({ 
         where: { 
          id: {
           [Op.not]: 48803247
          } 
         } 
        })

        firstDay.setHours(23, 59, 59, 999);
        lastDay.setHours(23, 59, 59, 999);

        let link_data = page_data(month, year)

        if (id === 0) {
            var no_team = teamMrr.non_associated_range(firstDay, lastDay)

            no_team.then(results => {
                res.render('pages/ps/reports/no_team_mrr_detail', { user: req.user, results: results, slug: 'mrr', moment: moment, link_data: link_data });
            })
        } else {
            var lbs = teamMrr.month_id(firstDay, lastDay, id)
            Promise.all([cft_name, lbs]).then(results => {
                for (i = 0; i < results[1].length; i++) {
                    results[1][i].total_mrr = results[1][i].lbs.reduce((prev, cur) => prev + cur.total_mrr, 0)
                }
                res.render('pages/ps/reports/team_mrr_detail', { user: req.user, projects: results[1], lp_space_id: process.env.LPWorkspaceId, slug: 'mrr', moment: moment, link_data: link_data, cftName: results[0][0].name });
            })
        }
    })
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