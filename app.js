require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const notesRouter = require("./routes/notes");

const app = express();
const port = process.env.PORT;

//middleware
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

//routes
app.use("/api/notes", notesRouter);

//connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    //listen for requests
    app.listen(port, () => {
      console.log(`Connected to database and listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });