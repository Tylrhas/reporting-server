var db = require('../../models')
var Sequelize = require("sequelize")
const Op = Sequelize.Op
var quater_month_map = {
  q1: {
    first: '01/01',
    last: '03/31'
  },
  q2: {
    first: '04/01',
    last: '06/30'
  },
  q3 : {
    first: '07/01',
    last: '10/31'
  },
  q4 : {
    first: '01/01',
    last: '03/31'
  }
}
module.exports = {
  quarter_activated_total,
  quarter_activated_ps_total,
  quarter_activated_da_total
  
}

async function quarter_activated_total(quarter, year) {
  db.lbs.sum(total_mrr, {
    where: {
      actual_go_live: 
    }
  })
  
}
async function quarter_activated_ps_total(quarter, year) {
  db.lbs.sum(total_mrr, {
    where: {

    }
  })
  
}
async function quarter_activated_da_total(quarter, year) {
  db.lbs.sum(total_mrr, {
    where: {

    }
  })
  
}
async function year(year) {
  
}