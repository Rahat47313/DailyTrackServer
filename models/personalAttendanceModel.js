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
  clockInTime: {
    type: String,
    default: null,
  },
  clockOutTime: {
    type: String,
    default: null,
  },
  specialCondition: {
    type: String,
    default: null,
  },
});

// Schema for monthly attendance
const monthlyAttendanceSchema = new Schema({
  days: {
    type: Map,
    of: dailyAttendanceSchema,
  },
});

// Schema for yearly attendance
const yearlyAttendanceSchema = new Schema({
  months: {
    type: Map,
    of: monthlyAttendanceSchema,
  },
});

// Main schema for personal attendance
const personalAttendanceSchema = new Schema(
  {
    years: {
      type: Map,
      of: yearlyAttendanceSchema,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PersonalAttendance", personalAttendanceSchema);
