var project = require('../controllers/projects')
module.exports = {
 getQueue,
 getProjectStatus,
 sumMRR
}

function getQueue() {
 // get all the projects that are not complete
 let queue = await project.active()
 // get the status and total MRR for each project
 for (let i = 0; i < queue.length; i++) {
  queue[i].totalMRR = await project.mrr(queue[i])
  queue[i].status = await project.status(queue[i])
 }
 return queue
 // sum the MRR for the project
}