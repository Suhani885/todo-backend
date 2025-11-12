const express = require("express");
const router = express.Router();
const Todo = require("../models/todoS");

function isAuth(req, res, next) {
  if (!req.session.userId) {
    return next({ status: 401, message: "Not authenticated" });
  }
  next();
}

router.get("/", isAuth, async (req, res, next) => {
  try {
    const todos = await Todo.find({
      user: req.session.userId,
      deleted: { $ne: true },
    });
    res.json({ todos });
  } catch (err) {
    next(err);
  }
});

router.get("/active", isAuth, async (req, res, next) => {
  try {
    const todos = await Todo.find({
      user: req.session.userId,
      completed: false,
      deleted: { $ne: true },
    });
    res.json({ todos });
  } catch (err) {
    next(err);
  }
});

router.get("/completed", isAuth, async (req, res, next) => {
  try {
    const todos = await Todo.find({
      user: req.session.userId,
      completed: true,
      deleted: { $ne: true },
    });
    res.json({ todos });
  } catch (err) {
    next(err);
  }
});

router.get("/deleted", isAuth, async (req, res, next) => {
  try {
    const todos = await Todo.find({
      user: req.session.userId,
      deleted: true,
    });
    res.json({ todos });
  } catch (err) {
    next(err);
  }
});

router.post("/", isAuth, async (req, res, next) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: "Task is required" });

    const todo = new Todo({
      task,
      user: req.session.userId,
      completed: false,
      deleted: false,
    });
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
      { _id: req.params.id, user: req.session.userId, deleted: { $ne: true } },
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
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.session.userId },
      { deleted: true },
      { new: true }
    );
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo deleted", todo });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/restore", isAuth, async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.session.userId, deleted: true },
      { deleted: false },
      { new: true }
    );
    if (!todo) return res.status(404).json({ error: "Deleted todo not found" });
    res.json({ message: "Todo restored", todo });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/permanent", isAuth, async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.session.userId,
      deleted: true,
    });
    if (!todo) return res.status(404).json({ error: "Deleted todo not found" });
    res.json({ message: "Todo permanently deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
