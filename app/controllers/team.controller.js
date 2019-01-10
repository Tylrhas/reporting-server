const db = require('../models')
module.exports = {
  realTeams
}

async function realTeams() {
  var teams = await db.cft.findAll({
    where: {
      real_team: true
    }
  })
  return teams
}