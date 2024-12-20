const express = require("express");
const {
  getTasks,
  getTasksByCategory,
  createTask,
  updateTask,
  deleteTask,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/taskController");

const router = express.Router();

// Task routes
router.get("/", getTasks);
router.get("/category/:categoryId", getTasksByCategory);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

// Category routes
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

module.exports = router;