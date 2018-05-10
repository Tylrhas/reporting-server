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
    db.sequelize.query("SELECT * FROM test_view", { type: db.Sequelize.QueryTypes.SELECT })
        .then(data => {
            res.send(data);
        })
}
exports.at_risk_CSV = function (req, res) {
    db.lp_task.findAll({
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
    }).then(results => {
        results = results
        var flattenedJSON = []
        for (i = 0; i < results.length; i++) {
            if(results[i].lp_project != null){
                var project = {
                    'task_name' : results[i].task_name,
                    'e_finish' : moment(results[i].e_finish).format( 'MM-DD-YYYY'),
                    'deadline' : moment(results[i].deadline).format( 'MM-DD-YYYY'),
                    'project_id' : results[i].project_id,
                    'project_name' : results[i].lp_project.project_name,
                    'priority' : results[i].lp_project_priorities[0].priority
                }
            }
            else {
                var project = {
                    'task_name' : results[i].task_name,
                    'e_finish' : moment(results[i].e_finish).format( 'MM-DD-YYYY'),
                    'deadline' : moment(results[i].deadline).format( 'MM-DD-YYYY'),
                    'project_id' : results[i].project_id,
                    'project_name' : null,
                    'priority' : results[i].lp_project_priorities[0].priority
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