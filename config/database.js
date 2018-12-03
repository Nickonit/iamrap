var mongoose = require("mongoose");
var user = "nishant";
var password = "nishant@12345";
const server = "localhost";
const dbport = "27017"; // REPLACE WITH YOUR DB SERVER
const database = "iamrap"; // REPLACE WITH YOUR DB NAME
class Database {
  constructor() {
    this.db();
  }
  db() {
    mongoose
      .connect(
        `mongodb://${server}:${dbport}/${database}`
        // {
        //   auth: {
        //     user: user,
        //     password: password
        //   },
        //   useNewUrlParser: true,
        //   useCreateIndex: true
        // }
      )
      .then(() => {
        console.log("Database connection successful");
      })
      .catch(err => {
        console.error("Database connection error::" + err);
      });
  }
}
module.exports = new Database();
