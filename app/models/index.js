"use strict";
var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
require('sequelize-hierarchy')(Sequelize);
var sequelize = new Sequelize(process.env.DATABASE_URL, {
  pool: {
    max: 5,
    min: 0,
    idle: 20000,
    acquire: 40000,
    evict: 20000,
  },
  dialectOptions: {
    // convert the string to a boolean
    ssl: (process.env.DATABASE_SSL =="true")
  }
}
);
var db = {};

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function (file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;