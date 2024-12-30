const express = require("express");
const {
  getAllAttendance,
  getAttendanceByYear,
  getAttendanceByMonth,
  getAttendanceByDate,
  clockIn,
  clockOut,
  deleteAttendance,
  autoClockOut,
} = require("../controllers/attendanceController");

const router = express.Router();

router.get("/", getAllAttendance);
router.get("/:year", getAttendanceByYear);
router.get("/:year/:month", getAttendanceByMonth);
router.get("/:year/:month/:day", getAttendanceByDate);
router.post("/:year/:month/:day/clockin", clockIn);
router.post("/:year/:month/:day/clockout", clockOut);
router.delete("/:year/:month/:day", deleteAttendance);

module.exports = router;