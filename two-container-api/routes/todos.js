const router = require("express").Router();
const Todo = require("../models/todo");

// CRUD todo routes

// get all todos
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.findAll({
      order: [["order", "ASC"]],
    });
    return res.status(200).json(todos);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Unable to GET todos", error });
  }
});

// get single todo
router.get("/:id", async (req, res) => {
  const todoId = req.params.id;
  try {
    const todo = await Todo.findByPk(todoId);
    return res.status(200).json(todo);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: `unable to get todo ${todoId}`, error });
  }
});

// create a todo
router.post("/", async (req, res) => {
  const { title, completed } = req.body;
  if (!title || completed === undefined) {
    return res.status(400).json({
      status: "error",
      message: "bad request, missing title or completed",
    });
  }
  // figure out the order value. By default, it will be last in the list.
  let order = await Todo.max("order");
  // if it's not null, incriment by 1 otherwise set to 1
  order ? (order += 1) : (order = 1);
  // create the todo
  try {
    const createdTodo = await Todo.create({
      title,
      completed,
      order,
    });
    res
      .status(201)
      .json({ status: "success", message: "created todo successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "unable to create todo" });
  }
});

// update a todo's title or completed
router.put("/:id", async (req, res) => {
  const { title, completed } = req.body;
  const todoId = req.params.id;
  if (!title && completed === undefined) {
    return res.status(400).json({
      status: "error",
      message: "bad request, missing title or completed",
    });
  }
  // find the todo then update
  try {
    const todo = await Todo.findByPk(todoId);
    // if the field was passed into the body, update it
    if (title) {
      await todo.update({ title });
    }
    if (completed !== undefined) {
      await todo.update({ completed });
    }
    await todo.save();
    return res.status(200).json({
      status: "success",
      message: `updated todo ${todoId}`,
    });
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .json({ status: "error", message: `todo ${todoId} not found` });
  }
});

// re-order the todo (special update)
router.put("/:id/:direction", async (req, res) => {
  const { id, direction } = req.params;
  // enforce value for direction
  if (!["up", "down"].includes(direction)) {
    return res.status(400).json({
      status: "error",
      message: `direction field must be 'up' or 'down'. Provided value: ${direction}`,
    });
  }
  let currentTodo, collateralTodo;
  try {
    // locate the current todo using provided ID
    currentTodo = await Todo.findByPk(id);
  } catch (error) {
    return res
      .status(404)
      .json({ status: "error", message: `Todo ${id} not found` });
  }
  // calculate the new order of the current todo by incrimenting or decrementing it
  const newOrderPosition =
    direction === "up" ? currentTodo.order - 1 : currentTodo.order + 1;
  if (newOrderPosition <= 0) {
    return res
      .status(400)
      .json({ status: "error", message: "Order cannot be zero" });
  }

  // attempt to locate the collateral todo at the new order position
  try {
    collateralTodo = await Todo.findOne({
      where: {
        order: newOrderPosition,
      },
    });
  } catch (error) {
    return res.status(404).json({
      status: "error",
      message: `Todo with order value ${newOrderPosition} not found`,
    });
  }

  // Now, each todo basically needs to swap places with each other
  try {
    // first update the collateral Todo with the current todo's order
    await collateralTodo.update({ order: currentTodo.order });
    await collateralTodo.save();
    // then update the current todo's order with the newOrderPosition (previously the collateral Todo's order)
    await currentTodo.update({ order: newOrderPosition });
    await currentTodo.save();
    return res.status(200).json({
      status: "success",
      message: `updated todo ${id}`,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "error", message: `Unable to re-order todo ${id}` });
  }
});

// delete a todo
router.delete("/:id", async (req, res) => {
  const todoId = req.params.id;
  try {
    const todo = await Todo.findByPk(todoId);
    await todo.destroy();
    return res.status(200).json({
      status: "success",
      message: `successfully deleted todo ${todoId}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      status: "error",
      message: `todo ${todoId} not found`,
    });
  }
});

module.exports = router;
