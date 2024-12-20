const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subtaskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  }
});

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  subtasks: [subtaskSchema],
  completed: {
    type: Boolean,
    default: false,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
}, { timestamps: true });

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  color: {
    type: String,
    required: true,
    default: "bg-[#000000]"
  }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
const Category = mongoose.model('Category', categorySchema);

module.exports = { Task, Category };