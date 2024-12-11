const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Schema for daily attendance
const dailyAttendanceSchema = new Schema({
  day: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "-"],
    required: true,
  },
});

// Schema for monthly attendance
const monthlyAttendanceSchema = new Schema({
  month: {
    type: String,
    required: true,
  },
  days: {
    type: Map,
    of: dailyAttendanceSchema,
    required: true,
  },
});

// Schema for yearly attendance
const yearlyAttendanceSchema = new Schema({
  year: {
    type: String,
    required: true,
  },
  months: {
    type: Map,
    of: monthlyAttendanceSchema,
    required: true,
  },
});

// Main schema for personal attendance
const personalAttendanceSchema = new Schema({
    attendance: {
        type: Map,
        of: yearlyAttendanceSchema,
        required: true,
      },
}, { timestamps: true });

module.exports = mongoose.model("PersonalAttendance", personalAttendanceSchema);