const express = require("express");

const router = express.Router();

//GET all notes
router.get('/', (req, res) => {
    res.json({mssg: "GET all notes"});
})

//GET single note
router.get('/:id', (req, res) => {
    res.json({mssg: "GET a single note"});
})

//POST a new note
router.post('/', (req, res) => {
    res.json({mssg: "POST a new note"});
})

//DELETE a note
router.delete('/:id', (req, res) => {
    res.json({mssg: "DELETE a note"});
})

//UPDATE a note
router.patch('/:id', (req, res) => {
    res.json({mssg: "UPDATE a note"});
})

module.exports = router;