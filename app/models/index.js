const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

let db = {}
require('sequelize-hierarchy')(Sequelize);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  pool: {
    max: parseInt(process.env.DATABASE_MAX_CONNECTIONS),
    min: parseInt(process.env.DATABASE_MIN_CONNECTIONS),
    idle: parseInt(process.env.DATABASE_IDLE),
    acquire: parseInt(process.env.DATABASE_AQUIRE),
    evict: parseInt(process.env.DATABASE_EVICT),
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
console.log({db})
module.exports = db;
