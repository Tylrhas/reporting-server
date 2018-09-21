var exports = module.exports = {}
var projects = require('../lib/controllers/projects')
//require api functions
lp_projects = require('./api/lp_projects');
lp_lbs = require('./api/lp_lbs');
backfill = require('../lib/controllers/backfill')
client_time = require('./jobs/client_time');
var Sequelize = require("sequelize")
//Models
var db = require("../models");
const Op = Sequelize.Op

const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64");

var Papa = require("papaparse")
var moment = require('moment')
// import the config for throttled request
var throttledRequest = require('../config/throttled_request')

//API Calls
exports.updatelpLbsapi = function (req, res) {
    lp_lbs.updateapi(req, res);
}

exports.findLBSProjects = function (req, res) {
    backfill.findMissingLBSProjects(req, res);
}
exports.updatelpprojectsapi = function (req, res) {
    lp_projects.updateProjectsapi(req, res);

}
exports.updatelptasksapi = function (req, res) {
    lp_tasks.updateAllTasks(req, res);
}
exports.at_risk_CSV = function (req, res) {

    var queryObject = {
        attributes: ['task_name', 'e_finish', 'deadline', 'project_id'],
        where: {
            'deadline': {
                [Op.not]: null
            },
            'date_done': null,
            'e_finish': {
                [Op.gt]: Sequelize.col('deadline')
            },
            [Op.or]: [{
                'task_name': {
                    [Op.like]: '%Activation%'
                }
            },
            {
                'task_name': {
                    [Op.like]: '%Launch%'
                }
            }
            ]

        },
        include: [{
            attributes: ['project_name'],
            model: db.lp_project
        },
        {
            attributes: ['priority'],
            model: db.lp_project_priority,
            where: {
                [Op.or]: [
                    { index: 3 },
                    { index: null }
                ]
            }
        }],
        // order by priority
        order: [
            [db.lp_project_priority, 'priority', 'ASC']
        ]
    }

    if (req.query) {
        if (req.query.start_date && req.query.end_date) {
            queryObject.where.deadline = {
                [Op.not]: null,
                [Op.between]: [decodeURIComponent(req.query.start_date), decodeURIComponent(req.query.end_date)]
            }
        }
        else if (req.query.start_date) {
            queryObject.where.deadline = {
                [Op.not]: null,
                [Op.gte]: decodeURIComponent(req.query.start_date)
            }
        }
        else if (req.query.end_date) {
            queryObject.where.deadline = {
                [Op.not]: null,
                [Op.lte]: decodeURIComponent(req.query.end_date)
            }
        }
    }

    db.lp_task.findAll(queryObject).then(results => {
        results = results
        var flattenedJSON = []
        for (i = 0; i < results.length; i++) {
            if (results[i].lp_project != null) {
                var project = {
                    'task_name': results[i].task_name,
                    'e_finish': moment(results[i].e_finish).format('MM-DD-YYYY'),
                    'deadline': moment(results[i].deadline).format('MM-DD-YYYY'),
                    'project_id': results[i].project_id,
                    'project_name': results[i].lp_project.project_name,
                    'priority': results[i].lp_project_priorities[0].priority
                }
            }
            else {
                var project = {
                    'task_name': results[i].task_name,
                    'e_finish': moment(results[i].e_finish).format('MM-DD-YYYY'),
                    'deadline': moment(results[i].deadline).format('MM-DD-YYYY'),
                    'project_id': results[i].project_id,
                    'project_name': null,
                    'priority': results[i].lp_project_priorities[0].priority
                }
            }
            flattenedJSON.push(project)
        }
        //convert this to CSV 
        var CSV = Papa.unparse(flattenedJSON)
        console.log(CSV)
        res.send(CSV);
    })

}

exports.updateUser = function (req, res) {
    console.log(req.body)
    db.user.update({ user_group: req.body.group }, {
        where: {
            id: req.body.id,
        }
    }).then(results => {
        res.status(200)
    })
}
exports.getProject = function (req, res) {
    db.treeitem.find({
        where: { id: req.params.project_id },
        include: {
            model: db.treeitem,
            as: 'descendents',
            hierarchy: true
        }
    }).then(function (result) {
        res.send(result)
    })
}

exports.updateNsBacklog = function (req, res) {
    res.status(200)
    var updates = []
    var data = req.body.data
    var row
    for (i = 0; i < data.length; i++) {
        if (data[i]['Internal ID'] !== undefined) {
            if (data[i].hasOwnProperty('Go-Live Date (Day)')) {
                row = {
                    id: data[i]['Internal ID'],
                    location_name: null,
                    total_mrr: data[i]['Total MRR'],
                    gross_ps: data[i]['Gross Professional Services'],
                    net_ps: data[i]['Net Professional Services'],
                    total_ps_discount: data[i]['Total Professional Services Discount'],
                    gross_cs: data[i]['Gross Creative Services'],
                    net_cs: data[i]['Net Creative Services'],
                    total_cs_discount: data[i]['Total Creative Services Discount'],
                    actual_go_live: data[i]['Go-Live Date (Day)'],
                    project_type: data[i]['Project Type']
                }
                if (data[i]['Location'].split(/\s(.+)/).length > 1) {
                    row.location_name = data[i]['Location'].split(/\s(.+)/)[1]
                } else {
                    row.location_name = data[i]['Location'].split(/\s(.+)/)[0]
                }
            } else {
                row = {
                    id: data[i]['Internal ID'],
                    location_name: null,
                    total_mrr: data[i]['Total MRR'],
                    gross_ps: data[i]['Gross Professional Services'],
                    net_ps: data[i]['Net Professional Services'],
                    total_ps_discount: data[i]['Total Professional Services Discount'],
                    gross_cs: data[i]['Gross Creative Services'],
                    net_cs: data[i]['Net Creative Services'],
                    total_cs_discount: data[i]['Total Creative Services Discount'],
                    estimated_go_live: data[i]['Estimated Go-Live Date (Day)'],
                    project_type: data[i]['Project Type']
                }
                if (data[i]['Location'].split(/\s(.+)/).length > 1) {
                    row.location_name = data[i]['Location'].split(/\s(.+)/)[1]
                } else {
                    row.location_name = data[i]['Location'].split(/\s(.+)/)[0]
                }
            }
            if (data[i]['Opportunity Close Date'] != '') {
                row.opportunity_close_date = data[i]['Opportunity Close Date']
            } else {
                row.opportunity_close_date = null
            }

            updates.push(db.lbs.upsert(row).then(results => {
                console.log(results)
            }))
        }
    }
    Promise.all(updates).then(() => {
        res.status(200)
        db.job.findAll({
            where: {
                jobname: 'ns_backlog'
            }
        }).then(results => {
            results[0].update({
                lastrun: new Date(),
                lastrunstatus: 'complete'
            })
        })
    })
}

exports.getAllProjects = function (req, res) {
    db.treeitem.findAll({
        order: Sequelize.col('hierarchyLevel')
    }).then(results => {
        res.send(results)
    })
}

exports.updateProjects = async function (req, res) {
    backfill.remote(req, res)
}
exports.updateArchivedProjects = async function (req, res) {
    backfill.archivedProjects(req,res)
}

exports.getTreeItems = function (req, res) {
    db.treeitem.findAll({
        // Will order ascending assuming ascending is the default order when direction is omitted
        order: Sequelize.col('hierarchyLevel')
    })
        .then(results => {
            res.send(results)
        })
}
exports.updateTeamProjects = function (req, res) {
    res.sendStatus(200)
    let teamIds = []
    // find CFT ID
    db.cft.findAll({
        attributes: ['id'],
        where: {
            id: {
                [Op.not]: 0
            }
        }
    })
        .then(results => {
            // organize team IDs into array 
            for (let i = 0; i < results.length; i++) {
                teamIds.push(results[i].id)
            }
            // get all projects 
            db.lp_project.findAll({})
                .then(results => {
                    for (let ri = 0; ri < results.length; ri++) {
                        let project = results[ri]
                        // API call to project
                        const auth = "Basic " + new Buffer(process.env.LpUserName + ":" + process.env.LPPassword).toString("base64")
                        let url = 'https://app.liquidplanner.com/api/workspaces/' + process.env.LPWorkspaceId + '/treeitems/' + results[ri].id
                        // let url = 'https://app.liquidplanner.com/api/workspaces/' + process.env.LPWorkspaceId  + '/treeitems/' + teamID +'?depth=1'
                        throttledRequest({ url: url, method: 'GET', headers: { "Authorization": auth } }, function (error, response, body) {
                            if (error) {
                                //Handle request error 
                                console.log(error);
                            } else {
                                // is it in PS Active folder
                                try {
                                    body = JSON.parse(body)
                                }
                                catch (error) {
                                    console.log(error)
                                }
                                if (body.error !== undefined) {
                                    console.log(body.error)
                                    if (body.error === 'NotFound') {
                                        results[ri].destroy()
                                    }
                                } else {
                                    if (project.id === 34359938) {
                                        console.log('woot')
                                    }
                                    if (body.parent_ids.indexOf(parseInt(process.env.ProServFolderId)) !== -1) {
                                        let updated = false
                                        for (i = 0; i < teamIds.length; i++) {
                                            // find the team it is associated with
                                            if (body.parent_ids.indexOf(parseInt(teamIds[i])) !== -1) {
                                                updated = true
                                                results[ri].update({
                                                    cft_id: teamIds[i],
                                                    is_archived: false
                                                })
                                            }
                                        }
                                        if (!updated) {
                                            results[ri].update({
                                                cft_id: 0,
                                                is_archived: false
                                            })
                                        }
                                    } else if (body.parent_ids.indexOf(parseInt(process.env.ProServArchiveFolder)) !== -1) {
                                        // is it in the PS archived folder
                                        results[ri].update({
                                            is_archived: true
                                        })
                                    }
                                    else {
                                        results[ri].destroy()
                                    }
                                }
                            }
                        })
                    }
                })

        })
}

function updateProject (project, teamID) {
    return db.treeitem.findOrCreate({
        where: {
            id: project.id
        },
        defaults: {
            e_start: project.expected_start,
            name: project.name,
            e_finish: project.expected_finish,
            deadline: project.promise_by,
            date_done: project.done_on,
            hrs_logged: project.hours_logged,
            hrs_remaning: project.high_effort_remaining,
            child_type: project.type.toLowerCase()
        }
    }).then(results => {
        db.lp_project.upsert({
            id: project.id,
            cft_id: teamID
        })
    })
}
async function createTreeItem (body) {
    return db.treeitem.findOrCreate({
        where: {
            id: body.id
        },
        defaults: {
            parent_id: body.parent_id,
            e_start: body.e_start,
            name: body.name,
            e_finish: body.e_finish,
            deadline: body.deadline,
            hrs_logged: body.hrs_logged,
            date_done: body.date_done,
            hrs_remaning: body.hrs_remaning,
            child_type: body.child_type,
            task_type: body.task_type
        }
    })
        .then(treeitem => {
            treeitem[0].update({
                parent_id: body.parent_id,
                e_start: body.e_start,
                name: body.name,
                e_finish: body.e_finish,
                deadline: body.deadline,
                hrs_logged: body.hrs_logged,
                date_done: body.date_done,
                hrs_remaning: body.hrs_remaning,
                child_type: body.child_type,
                task_type: body.task_type
            })
        })
}