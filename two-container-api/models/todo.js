const Sequelize = require("sequelize");
const db = require("../db.js");

const Todo = db.define("todo", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: Sequelize.STRING,
  completed: Sequelize.BOOLEAN,
  order: Sequelize.INTEGER,
});

module.exports = Todo;
