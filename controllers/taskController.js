const { Task, Category } = require("../models/taskModel");
const mongoose = require("mongoose");

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).populate("category");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get tasks by category
const getTasksByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const tasks = await Task.find({ category: categoryId }).populate(
      "category"
    );
    res.status(200).json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  const { title, description, dueDate, categoryId, subtasks } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      dueDate,
      category: categoryId,
      subtasks: subtasks || [],
      user: req.user._id,
    });
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    const categoriesWithTasks = await Promise.all(
      categories.map(async (category) => {
        const tasks = await Task.find({ category: category._id });
        return {
          ...category.toObject(),
          tasks: tasks,
        };
      })
    );
    res.status(200).json(categoriesWithTasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  const { name, color } = req.body;

  try {
    const category = await Category.create({ 
      name,
      color,
      user: req.user._id
    });
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    await Task.deleteMany({ category: id });
    await Category.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Category and associated tasks deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getTasks,
  getTasksByCategory,
  createTask,
  updateTask,
  deleteTask,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
