var exports = module.exports = {}
//Models
var db = require("../../models")
var Sequelize = require("sequelize")
const Op = Sequelize.Op

async function createProject (body) {
    return db.lp_project.findOrCreate({
      where: {
        id: body.id
    }
    }).then(() => {
      // create the tree item
      createTreeItem(body)
    })
}

async function createTreeItem (body) {
  return db.treeitem.findOrCreate({
      where: {
          id: body.id
      },
      defaults: {
          name: body.name,
      }
  })
      .then(treeitem => {
          treeitem[0].update({
              name: body.name,
          })
      })
}

exports.createAPIProject = createProject