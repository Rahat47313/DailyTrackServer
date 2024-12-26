const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        enum: ['superAdmin', 'admin', 'employee'],
        required: true,
      }
}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);