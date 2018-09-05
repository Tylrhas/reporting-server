var Sequelize = require("sequelize")
const Op = Sequelize.Op
//Models
var db = require("../../models")
var moment = require('moment');
var teamMrr = require('../../lib/reports/team_mrr')
var cfts = require('../../lib/reports/cft')

module.exports = function (app, passport) {
app.get('/reports/mrr/:month/:year/teams', checkAuthentication, function (req, res) {
    // get all LBS items launched this month and match to project and CFT and sum the totals for each team

    var month = parseInt(req.params.month)
    var year = parseInt(req.params.year)

    var date = {
        month, 
        year
    }

    var firstDay = new Date(year, month - 1, 0);
    var lastDay = new Date(year, month, 0);

    firstDay.setHours(23, 59, 59, 999);
    lastDay.setHours(23, 59, 59, 999);

    var mrr = teamMrr.month(firstDay, lastDay)
    var teams = cfts.getall()
    var non_assigned_mrr = teamMrr.non_associated_total(firstDay, lastDay)


    Promise.all([mrr, teams, non_assigned_mrr]).then(results => {
        // set up an object with all teams and associated MRR
        var teamMrr = {}
        for (i = 0; i < results[1].length; i++) {
            let key = results[1][i].id
            teamMrr[key] = {
                name: results[1][i].name,
                mrr: 0
            }
        }

        for (i2 = 0; i2 < results[0].length; i2++) {
            let project = results[0][i2]
            let cft_id = results[0][i2].cft_id
            for (i3 = 0; i3 < project.lbs.length; i3++) {
                let lbs_mrr = project.lbs[i3].total_mrr
                teamMrr[cft_id].mrr = teamMrr[cft_id].mrr + lbs_mrr
            }
        }

        teamMrr = Object.keys(teamMrr).map(function (key) {
            return [key, teamMrr[key].name, teamMrr[key].mrr]
        })

        teamMrr[0][2] = teamMrr[0][2] + results[2]

        res.render('pages/team_mrr', { user: req.user, teamMrr: teamMrr, date: date, lastDay: lastDay, slug: 'mrr', moment: moment });
    })
})
app.get('/reports/mrr/:month/:year/teams/:teamid', checkAuthentication, function (req, res) {
    var id = parseInt(req.params.teamid)
    var month = parseInt(req.params.month)
    var year = parseInt(req.params.year)

    var firstDay = new Date(year, month - 1, 0);
    var lastDay = new Date(year, month, 0);
    var cft_name = db.cft.findAll({where: {id : id}})

    firstDay.setHours(23, 59, 59, 999);
    lastDay.setHours(23, 59, 59, 999);

    var date = {
        month, 
        year
    }

    if (id === 0) {
        var no_team = teamMrr.non_associated_range(firstDay, lastDay)

        no_team.then(results => {
            res.render('pages/no_team_mrr_detail', { user: req.user, results: results, slug: 'mrr', moment: moment, date: date, lastDay: lastDay });
        })
    } else {
      var lbs = teamMrr.month_id(firstDay, lastDay, id)
      Promise.all([cft_name, lbs]).then(results => {
        for (i = 0; i < results[1].length; i++) {
          results[1][i].total_mrr = results[1][i].lbs.reduce((prev, cur) => prev + cur.total_mrr, 0)
      }
      res.render('pages/team_mrr_detail', { user: req.user, projects: results[1], lp_space_id: process.env.LPWorkspaceId, slug: 'mrr', moment: moment, month: month, year: year, lastDay: lastDay, cftName: results[0][0].name, date: date });

      })
        lbs.then(results => {
        })
    }
})
app.get('/reports/mrr/:year',checkAuthentication,function(req, res) {
  var year = parseInt(req.params.year)
  totalAcrtivatedMRR = db.lbs.sum('total_mrr', {
    where: {
      actual_go_live: {
        [Op.between]: [firstDay, lastDay]
    },
    }
  })
  totalBacklogMRR = db.lbs.sum('total_mrr', {
    where: {
      estimated_go_live: {
      [Op.between]: [firstDay, lastDay]
      }
    }
  })
})

function isAdmin (req, res, next) {
    if (req.isAuthenticated() && req.user.user_group == 'admin') {

        return next();

    }
    else {
        res.redirect('/');
    }
}
function checkAuthentication (req, res, next) {
    if (req.isAuthenticated()) {
        // if user is looged in, req.isAuthenticated() will return true
        next()
    } else {
        res.redirect('/g5_auth/users/auth/g5')
    }
}
}