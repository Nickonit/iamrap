const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const songSchema = new Schema({
  title: {
    type: String
  },
  artistName: {
    type: String
  },
  image: {
    type: String,
    default: ""
  },
  songFile: {
    type: String,
    default: ""
  },
  versionKey: false
});

const Song = mongoose.model("Song", songSchema);
module.exports = Song;
