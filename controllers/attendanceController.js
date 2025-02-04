const Attendance = require("../models/attendanceModel");
const mongoose = require("mongoose");

// Get all attendance records
const getAllAttendance = async (req, res) => {
  try {
    let query = {};

    // If superAdmin, can see all
    if (req.user.userType === "superAdmin") {
      query = {};
    }
    // If admin, can see self and employees
    else if (req.user.userType === "admin") {
      query = { visibleTo: req.user._id };
    }
    // If employee, can only see own attendance
    else {
      query = { user: req.user._id };
    }

    const attendanceRecords = await Attendance.find(query);
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get attendance record by year
const getAttendanceByYear = async (req, res) => {
  const { year } = req.params;

  try {
    let query = { user: req.user._id };

    // Import User model
    const User = require("../models/userModel");

    // Filter based on user type
    if (req.user.userType === "superAdmin") {
      // Can see all attendance records
      query = {};
    } else if (req.user.userType === "admin") {
      // Can see admins and employees so get their IDs
      const userIds = await User.find({
        userType: { $in: ["admin", "employee"] }
      }).distinct('_id');

      // query.user = {
      //   $in: await User.find({
      //     userType: { $in: ["admin", "employee"] },
      //   }).distinct("_id"),
      // };

      // Add current admin's ID
      userIds.push(req.user._id);
      
      query.user = { $in: userIds };
    } else {
      // Employees see only their own
      query.user = req.user._id;
    }

    console.log("Query:", query); // Debug log
    console.log("Current user:", req.user); // Debug log

    const attendanceRecords = await Attendance.find(query)
      .populate('user', 'name email userType')
      .lean(); // Convert to plain object
      // .select('years user');

    // Transform Map data to plain objects for frontend
    const formattedData = {};
    attendanceRecords.forEach(record => {
      const { user, years } = record;

      // Convert years Map to object
      const yearsObj = {};
      Object.entries(years || {}).forEach(([yearKey, yearData]) => {
        const monthsObj = {};

        // Convert months Map to object
        Object.entries(yearData.months || {}).forEach(([monthKey, monthData]) => {
          const daysObj = {};

          // Convert days Map to object
          Object.entries(monthData.days || {}).forEach(([dayKey, dayData]) => {
            daysObj[dayKey] = {
              status: dayData.status,
              clockInTime: dayData.clockInTime,
              clockOutTime: dayData.clockOutTime,
              specialCondition: dayData.specialCondition
            };
          });
          monthsObj[monthKey] = { days: daysObj };
        });
        yearsObj[yearKey] = { months: monthsObj };
      });

      formattedData[record.user._id] = {
        user: record.user,
        years: yearsObj
      };
    });

    console.log("Formatted data:", formattedData); // Debug log
    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error in attendanceController getAttendanceByYear: ", error);
    res.status(400).json({ error: error.message });
  }
};

// Get attendance record by year and month
const getAttendanceByMonth = async (req, res) => {
  const { year, month } = req.params;

  // if (!year || !month) {
  //   return res.status(400).json({ error: 'Year and month are required' });
  // }

  try {
    const attendanceRecord = await Attendance.findOne({ user: req.user._id });

    if (!attendanceRecord) {
      return res.status(200).json({});
    }

    const yearData = attendanceRecord.years.get(year);
    const monthData = yearData?.months?.get(month);

    // Transform Map data to plain object
    const formattedData = {
      [year]: {
        users: {
          [req.user._id]: {
            days: monthData?.days ? Object.fromEntries(monthData.days) : {},
          },
        },
      },
    };

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get attendance record by year, month, and day
const getAttendanceByDate = async (req, res) => {
  const { year, month, day } = req.params;

  try {
    const attendanceRecord = await Attendance.findOne({
      "attendance.year": year,
    });
    if (
      !attendanceRecord ||
      !attendanceRecord.attendance[year].months[month] ||
      !attendanceRecord.attendance[year].months[month].days[day]
    ) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    res
      .status(200)
      .json(attendanceRecord.attendance[year].months[month].days[day]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create or update attendance record for clock-in
const clockIn = async (req, res) => {
  const { year, month, day } = req.params;
  const clockInTime = new Date().toLocaleTimeString();

  try {
    let attendanceRecord = await Attendance.findOne({ user: req.user._id });

    if (!attendanceRecord) {
      // Create new record with user reference
      attendanceRecord = new Attendance({
        user: req.user._id,
        years: new Map([
          [
            year,
            {
              months: new Map([
                [
                  month,
                  {
                    days: new Map([
                      [
                        day,
                        {
                          // day: parseInt(day),
                          status: "Present",
                          clockInTime: clockInTime,
                          clockOutTime: null,
                        },
                      ],
                    ]),
                  },
                ],
              ]),
            },
          ],
        ]),
      });
    } else {
      // Update existing record
      if (!attendanceRecord.years.has(year)) {
        attendanceRecord.years.set(year, { months: new Map() });
      }

      const yearDoc = attendanceRecord.years.get(year);
      if (!yearDoc.months.has(month)) {
        yearDoc.months.set(month, { days: new Map() });
      }

      const monthDoc = yearDoc.months.get(month);
      monthDoc.days.set(day.toString(), {
        status: "Present",
        clockInTime: clockInTime,
        clockOutTime: null,
      });

      attendanceRecord.markModified("years");
    }

    await attendanceRecord.save();
    res.status(200).json(attendanceRecord);
  } catch (error) {
    console.error("Error in clockIn:", error);
    res.status(400).json({ error: error.message });
  }
};

const clockOut = async (req, res) => {
  const { year, month, day } = req.params;
  const clockOutTime = new Date().toLocaleTimeString();

  try {
    const attendanceRecord = await Attendance.findOne({ user: req.user._id });

    if (!attendanceRecord || !attendanceRecord.years) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    const yearDoc = attendanceRecord.years.get(year);
    if (!yearDoc || !yearDoc.months) {
      return res.status(404).json({ error: "Year not found" });
    }

    const monthDoc = yearDoc.months.get(month);
    if (!monthDoc || !monthDoc.days) {
      return res.status(404).json({ error: "Month not found" });
    }

    // Convert day to string since Map keys are strings
    const dayDoc = monthDoc.days.get(day.toString());
    if (!dayDoc) {
      return res.status(404).json({ error: "Day not found" });
    }

    dayDoc.clockOutTime = clockOutTime;
    attendanceRecord.markModified("years");

    await attendanceRecord.save();
    res.status(200).json(attendanceRecord);
  } catch (error) {
    console.error("Error in clockOut:", error);
    res.status(400).json({ error: error.message });
  }
};

// Automatically clock out users at 11:59 PM
const autoClockOut = async () => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = now.toLocaleString("default", { month: "short" }).toUpperCase();
  const day = now.getDate().toString();

  try {
    const attendanceRecord = await Attendance.findOne();

    if (!attendanceRecord || !attendanceRecord.years) {
      return;
    }

    const yearDoc = attendanceRecord.years.get(year);
    if (!yearDoc || !yearDoc.months) {
      return;
    }

    const monthDoc = yearDoc.months.get(month);
    if (!monthDoc || !monthDoc.days) {
      return;
    }

    const dayDoc = monthDoc.days.get(day);
    if (dayDoc && dayDoc.status === "Present" && !dayDoc.clockOutTime) {
      dayDoc.clockOutTime = "23:59:59";
      attendanceRecord.markModified("years");
      await attendanceRecord.save();
    }
  } catch (error) {
    console.error("Failed to auto clock out:", error);
  }
};

// Delete an attendance record
const deleteAttendance = async (req, res) => {
  const { year, month, day } = req.params;

  try {
    const attendanceRecord = await Attendance.findOne({
      "attendance.year": year,
    });

    if (!attendanceRecord) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    if (!attendanceRecord.attendance[year].months[month]) {
      return res.status(404).json({ error: "Month not found" });
    }

    if (!attendanceRecord.attendance[year].months[month].days[day]) {
      return res.status(404).json({ error: "Day not found" });
    }

    delete attendanceRecord.attendance[year].months[month].days[day];

    await attendanceRecord.save();
    res.status(200).json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllAttendance,
  getAttendanceByYear,
  getAttendanceByMonth,
  getAttendanceByDate,
  clockIn,
  clockOut,
  deleteAttendance,
  autoClockOut,
};
