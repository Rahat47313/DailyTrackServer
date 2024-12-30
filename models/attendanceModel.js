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
const attendanceSchema = new Schema(
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
    // // Field to control visibility
    // visibleTo: [{
    //   type: Schema.Types.ObjectId,
    //   ref: "User"
    // }]
  },
  { timestamps: true }
);

// Add middleware to automatically set visibility based on user type
attendanceSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('user')) {
    const User = mongoose.model('User');
    
    // Get all admins and superAdmins
    const adminUsers = await User.find({
      userType: { $in: ['admin', 'superAdmin'] },
      active: true
    });

    // Set visibility for admins and superAdmins
    this.visibleTo = adminUsers.map(user => user._id);
    
    // Add the attendance owner to visibility list
    if (!this.visibleTo.includes(this.user)) {
      this.visibleTo.push(this.user);
    }
  }
  next();
});

// Add method to check visibility
attendanceSchema.methods.isVisibleTo = function(userId) {
  return this.visibleTo.includes(userId) || this.user.equals(userId);
};

module.exports = mongoose.model("attendance", attendanceSchema);