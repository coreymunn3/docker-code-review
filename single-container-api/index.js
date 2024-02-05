const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.get("/test", (req, res) => {
  res.status(200).send({ message: "test" });
});

// get all posts
app.get("/posts", async (req, res) => {
  console.log("reaching out for posts...");
  try {
    const posts = await axios.get("https://jsonplaceholder.typicode.com/posts");
    res.status(200).json(posts.data);
  } catch (error) {
    res.status(500).send({
      message: JSON.stringify(error),
    });
  }
});

// get a single post by ID
app.get("/posts/:id", async (req, res) => {
  const id = req.params.id;
  console.log(`reaching out for post ${id} ...`);
  try {
    const posts = await axios.get(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );
    res.status(200).json(posts.data);
  } catch (error) {
    res.status(500).send({
      message: JSON.stringify(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
