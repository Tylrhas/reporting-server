const db = require('../models')
Op = db.Sequelize.Op
module.exports = {
  realTeams,
  getName,
  noAssociatedTeam
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

async function noAssociatedTeam () {
  var teams = await db.cft.findAll({
    where: {
      real_team: true,
      id : {
        [Op.not]: 0
      }
    },
    order: [
      ['id', 'DESC']
    ]
  })
  return teams
}