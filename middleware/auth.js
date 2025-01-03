const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || !user.active) {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const adminMiddleware = async (req, res, next) => {
  if (req.user?.userType === "employee") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

const superAdminMiddleware = async (req, res, next) => {
  if (req.user?.userType !== "superAdmin") {
    return res.status(403).json({ error: "Super Admin access required" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, superAdminMiddleware };
