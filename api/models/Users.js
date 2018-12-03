const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    email: {
      type: String
    },
    mobile_no: {
      type: String
    },
    password: {
      type: String
    },
    country: {
      type: String
    },
    profileImg: {
      type: String
    },
    login_type: {
      type: String,
      required: true
    },
    social_id: {
      type: String
    }
  },
  { versionKey: false }
);

const Users = mongoose.model("Users", userSchema);
module.exports = Users;
