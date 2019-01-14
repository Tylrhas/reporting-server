const db = require('../models')
module.exports = {
  realTeams,
  getName
}

async function realTeams() {
  var teams = await db.cft.findAll({
    where: {
      real_team: true
    },
    order: [
      ['id', 'DESC']
    ]
  })
  return teams
}

async function getName (id) {
  var teamName = null
  var team = await db.cft.findOne({
    where: {
      id: id
    }
  })
  if (team) {
    teamName = team.name
  }
  return teamName
}