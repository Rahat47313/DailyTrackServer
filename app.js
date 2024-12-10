require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT;
const notesRouter = require("./routes/notes");

//middleware
app.use(express.json());
app.use(cors())
app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

app.use("/api/notes", notesRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});