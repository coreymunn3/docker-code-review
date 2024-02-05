const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: "localhost",
    port: 5432,
    dialect: "postgres",
  }
);
// test the connection
try {
  sequelize.authenticate();
  console.log("Authenticated Successfully.");
} catch (error) {
  console.error("Unable to authenticate to the database:", error);
}

module.exports = sequelize;
