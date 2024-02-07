const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    // use when running api inside dedicated network
    host: "todos-db",
    port: 5432,
    // docker run commands for this:
    // docker run -d --name todos-db --network todos-net -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=todos -v todos_pgdata:/var/lib/postgresql/data postgres:16-alpine
    // docker run -d --name todos-backend -p 5000:5000 -v /Users/michaelmunn/Training/docker-practical-guide/basic-todos-api:/app -v /app/node_modules --network todos-net todos-api

    // use when running api in container
    // host: "host.docker.internal",
    // port: 25432,
    // docker run commands for this:
    // docker run -d --name todos-db -p 25432:5432 -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=todos postgres:16-alpine
    // docker run -d --name todos-backend -p 5000:5000 todos-api

    // use when running api on local machine
    // host: "localhost",
    // port: 25432,
    // docker run commands same as above
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
