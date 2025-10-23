const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

function isAuth(req, res, next) {
  if (!req.session.userId) {
    return next({ status: 401, message: "Not authenticated" });
  }
  next();
}

router.get("/", isAuth, async (req, res, next) => {
  try {
    const todos = await Todo.find({ user: req.session.userId });
    res.json({ todos });
  } catch (err) {
    next(err);
  }
});

router.post("/", isAuth, async (req, res, next) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: "Task is required" });

    const todo = new Todo({ task, user: req.session.userId, completed: false });
    await todo.save();
    res.json({ message: "Todo added", todo });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", isAuth, async (req, res, next) => {
  try {
    const { task, completed } = req.body;
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.session.userId },
      { task, completed },
      { new: true }
    );
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo updated", todo });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", isAuth, async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.session.userId,
    });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
