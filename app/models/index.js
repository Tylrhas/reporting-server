const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

let db = {}
require('sequelize-hierarchy')(Sequelize);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  pool: {
    max: process.env.DATABASE_MAX_CONNECTIONS,
    min: process.env.DATABASE_MIN_CONNECTIONS,
    idle: process.env.DATABASE_IDLE,
    acquire: process.env.DATABASE_AQUIRE,
    evict: process.env.DATABASE_EVICT,
  },
  dialectOptions: {
    // convert the string to a boolean
    ssl: (process.env.DATABASE_SSL == 'true'),
  },
})

fs
  .readdirSync(__dirname)
  .filter((file) => (file.indexOf(".") !== 0) && (file !== "index.js"))
  .forEach((file) => {
    let model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
