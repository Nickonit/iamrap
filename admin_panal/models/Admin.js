const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    username: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      default: ""
    },
    created_At: {
      type: Date,
      default: Date.now
    }
  },
  { virsonkey: false }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
