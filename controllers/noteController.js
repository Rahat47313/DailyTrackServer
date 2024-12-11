const Note = require("../models/noteModel");
const mongoose = require("mongoose");

//get all notes
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({});
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get a single note
const getNote = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Note ID invalid" });
  }

  try {
    const note = await Note.findById(id);
    res.status(200).json(note);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

//create a new note
const createNote = async (req, res) => {
  const { content } = req.body;

  //add a new note to the database
  try {
    const note = await Note.create({ content });
    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//update a note
const updateNote = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Note ID invalid" });
  }

  try {
    const note = await Note.findOneAndUpdate({ _id: id }, { ...req.body });
    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//delete a note
const deleteNote = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Note ID invalid" });
  }

  try {
    await Note.findByIdAndDelete({ _id: id });
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};
