const express = require("express");
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

const router = express.Router();

//GET all notes
router.get("/", getNotes);

//GET single note
router.get("/:id", getNote);

//POST a new note
router.post("/", createNote);

//UPDATE a note
router.patch("/:id", updateNote);

//DELETE a note
router.delete("/:id", deleteNote);

module.exports = router;