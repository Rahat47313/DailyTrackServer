require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const { authMiddleware } = require('./middleware/auth');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
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
app.use('/api/auth', authRouter);
app.use("/api/notes", authMiddleware, notesRouter);
app.use("/api/attendance", authMiddleware, attendanceRouter);
app.use("/api/tasks", authMiddleware, tasksRouter);
app.use("/api/admin", authMiddleware, adminRouter);

//connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    //listen for requests
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log(error);
  });

// const { autoClockOut } = require("./controllers/attendanceController");

// // Schedule a task to run at 11:59 PM every day
// cron.schedule("59 23 * * *", async () => {
//   await autoClockOut();
//   console.log("Auto clock-out completed at 11:59 PM");
// });

module.exports = app;