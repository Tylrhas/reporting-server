var db = require('../../models')
module.exports = [
  coco
]
async function coco (req, res) {
  // find all projects that are active for a given team
  let projects = await db.db.lp_project.findAll({
    where: {
      is_done: false,
      is_archived: false,
      cft_id: 44790301
    },
    include: [
      {
        model: db.treeitem,
        where: {
          name: {
            [Op.or]: [ {name:{[Op.like]: '%Implementation Ready%'}}, {name:{[Op.like]: '%Build Ready'}}, {name:{[Op.like]: '%Peer Review%'}}, {name:{[Op.like]: '%SEO Staging Review%'}}, {name:{[Op.like]: '%PM Review%'}}, {name:{[Op.like]: '%Staging Quality Control%'}}, {name:{[Op.like]: '%Staging Links Delivered%'}} ]
          }
        }
      }
    ]
  })
  console.log('projects')
  res.json(projects)

  // find all tasks within those projects for timeline calculation
  // caclulate each timeline
  // average them for each phase

}