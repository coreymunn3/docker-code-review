const express = require("express");
const db = require("./db");
const todoRouter = require("./routes/todos");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.get("/test", (req, res) => {
  res.status(200).send({ message: "test" });
});

// Routes
app.use("/api/todo", todoRouter);

// Default response for any other request
app.use(function (req, res) {
  res.status(404);
});

db.sync({ alter: true })
  .then((result) => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
