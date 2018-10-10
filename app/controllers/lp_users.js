var exports = module.exports = {}
//Models
var db = require("../models");
var Sequelize = require("sequelize")
const Op = Sequelize.Op
exports.get_all = get_all
function get_all() {
    return db.lp_user.findAll().then(users => {
        userObject = {}
        for (i = 0; i < users.length; i++) {
            user = users[i]
            key = user.first_name.toLowerCase() + ' ' + user.last_name.toLowerCase()
            key = key.replace(/ /g,"_")
            userObject[key] = {
                first_name: user.first_name,
                last_name: user.last_name,
                id: user.id
            }
        }
        return userObject
    })
}