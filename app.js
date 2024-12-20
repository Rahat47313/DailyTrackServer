require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const notesRouter = require("./routes/notes");
const attendanceRouter = require("./routes/attendance");
const tasksRouter = require("./routes/tasks");

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
app.use("/api/attendance", attendanceRouter)
app.use("/api/tasks", tasksRouter);

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

const { autoClockOut } = require("./controllers/personalAttendanceController");

// Schedule a task to run at 11:59 PM every day
cron.schedule("59 23 * * *", async () => {
  await autoClockOut();
  console.log("Auto clock-out completed at 11:59 PM");
});
