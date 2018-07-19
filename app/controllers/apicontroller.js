var exports = module.exports = {}
//require api functions
lp_projects = require('./api/lp_projects');
lp_lbs = require('./api/lp_lbs');
client_time = require('./jobs/client_time');

var Sequelize = require("sequelize")
//Models
var db = require("../models");
const Op = Sequelize.Op

var Papa = require("papaparse")
var moment = require('moment')
const request = require("request"),
    throttledRequest = require('throttled-request')(request);
var rp = require('request-promise');
//This will throttle the requests so no more than 20 are made every 15 seconds 
throttledRequest.configure({
    requests: 20,
    milliseconds: 15000
});

//API Calls
exports.updatelpLbsapi = function (req, res) {
    lp_lbs.updateapi(req, res);
}
exports.updatelpprojectsapi = function (req, res) {
    lp_projects.updateProjectsapi(req, res);

}
exports.updatelptasksapi = function (req, res) {
    lp_tasks.updateAllTasks(req, res);
}

exports.test_view = function (req, res) {
    db.Sequelize.query("SELECT * FROM test_view", { type: db.Sequelize.QueryTypes.SELECT })
        .then(data => {
            res.send(data);
        })
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
    for (i = 0; i < data.length; i++) {
        if (data[i]['Internal ID'] !== undefined) {
            let row = {
                id: data[i]['Internal ID'],
                location_name: null,
                total_mrr: data[i]['Total MRR'],
                gross_ps: data[i]['Gross Professional Services'],
                net_ps: data[i]['Net Professional Services'],
                total_ps_discount: data[i]['Total Professional Services Discount'],
                gross_cs: data[i]['Gross Creative Services'],
                net_cs: data[i]['Net Creative Services'],
                total_cs_discount: data[i]['Total Creative Services Discount'],
                opportunity_close_date: data[i]['Opportunity Close Date']
            }
            if (data[i]['Location'].split(/\s(.+)/).length > 1) {
                row.location_name = data[i]['Location'].split(/\s(.+)/)[1]
            } else {
                row.location_name = data[i]['Location'].split(/\s(.+)/)[0]
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
    console.log(process.env.production)
    if (process.env.production === "false") {
        let url = process.env.PRODUCTION_URL + '/api/treeitems'
        let result = await rp.get({ url: url })
        console.log(result)
        // dump all new data
        result = JSON.parse(result)
        if (result.length) {
            for (let i = 0; i < result.length; i++) {
                // create promise all
                await createTreeItem(result[i])
            if (result[i].task_type === 'Location Service Billing' && result[i].child_type === 'task') {
                    let splitName = result[i].name.split(/\s(.+)/, 2)
                    let LBSId = splitName[0]
                    let locationName = splitName[1]
                    let lbsTask = await db.lbs.findOrCreate({ where: { id: LBSId }, defaults: { location_name: locationName, task_id: result[i].id } })
                    lbsTask[0].update({ location_name: locationName, task_id: result[i].id })
                }
            }
            res.send('200')
            db.job.findAll({
                where: {
                    jobname: 'external_update'
                }
            }).then(results => {
                results[0].update({
                    lastrun: new Date(),
                    lastrunstatus: 'complete'
                })
            })
        }
    } else {
        res.send("only available on non-production Enviornments")
        db.job.findAll({
            where: {
                jobname: 'external_update'
            }
        }).then(results => {
            results[0].update({
                lastrun: new Date(),
                lastrunstatus: 'error'
            })
        })
    }
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