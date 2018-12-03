const User = require("../models/Users");
const connection = require("../../config/database");
const bcrypt = require("bcrypt-nodejs");
const nodemailer = require("nodemailer");
const config = require("../../config/config.json");
const Songs = require("../../admin_panal/models/Song");

module.exports = {
  register: (req, res) => {
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return res.json({
          code: 0,
          massage: "Email is already Registered",
          resullt: {}
        });
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password),
          mobile_no:
            req.body.mobile_no === undefined ? " " : req.body.mobile_no,
          social_id:
            req.body.social_id === undefined ? " " : req.body.social_id,
          country: req.body.country,
          profileImg:
            req.file === undefined ? " " : req.file.path.replace(/\\/gi, "/"),
          login_type: "LS"
        });
        newUser
          .save()
          .then(user => {
            res.json({
              code: 1,
              msg: "User Successfullly Created",
              result: user
            });
          })
          .catch(err =>
            res.json({
              code: 0,
              msg: "something went wrong",
              result: {}
            })
          );
      }
    });
  },
  login: (req, res) => {
    var credantial = {};
    switch (req.body.login_type) {
      case "LS":
        User.findOne({ email: req.body.email })
          .then(user => {
            if (!user) {
              return res.json({
                code: 0,
                msg: "Invalid Email",
                result: {}
              });
            }
            let pass = bcrypt.compareSync(req.body.password, user.password);
            if (pass) {
              return res.json({
                code: 1,
                msg: "login successfully",
                result: user
              });
            } else {
              return res.json({
                code: 0,
                msg: "Wrong password",
                result: {}
              });
            }
          })
          .catch(err =>
            res.json({
              code: 0,
              msg: "invalid credantial",
              result: {}
            })
          );
        break;
      case "FB":
        if (req.body.social_id == undefined || req.body.social_id == "") {
          return res.json({
            code: 0,
            msg: "Needing Social ID",
            return: {}
          });
        }
        User.findOne({ social_id: req.body.social_id })
          .then(user => {
            if (user) {
              return res.json({
                code: 1,
                msg: "login successfully",
                result: user
              });
            } else {
              if (req.body.email != undefined) {
                credantial["$or"] = [{ email: req.body.email }];
              } else if (req.body.mobile_no != undefined) {
                credantial["$or"] = [{ mobile_no: req.body.mobile_no }];
              } else if (
                req.body.email != undefined &&
                req.body.mobile_no != undefined
              ) {
                credantial["$or"] = [
                  { mobile_no: req.body.mobile_no },
                  { email: req.body.email }
                ];
              } else {
                credantial["$or"] = [{ social_id: req.body.social_id }];
              }
              User.findOne(credantial)
                .then(user => {
                  if (user) {
                    return res.json({
                      code: 0,
                      msg: "Email or mobile_no is Already Exist",
                      result: {}
                    });
                  } else {
                    let use = {
                      name: req.body.name == undefined ? "" : req.body.name,
                      login_type: req.body.login_type,
                      country:
                        req.body.country == undefined ? "" : req.body.country,
                      social_id: req.body.social_id,
                      email: req.body.email == undefined ? "" : req.body.email,
                      mobile_no:
                        req.body.mobile_no == undefined
                          ? ""
                          : req.body.mobile_no,
                      profileImg:
                        req.body.profileImg === undefined
                          ? ""
                          : req.body.profileImg
                    };
                    let newFbUser = new User(use);
                    newFbUser.save().then(user => {
                      res.json({
                        code: 1,
                        msg: "Fb User Successfully Created",
                        result: user
                      });
                    });
                  }
                })
                .catch(err =>
                  res.json({
                    code: 0,
                    msg: "something went wrong",
                    result: {}
                  })
                );
            }
          })
          .catch(err =>
            res.json({
              code: 0,
              msg: "check social Id",
              result: {}
            })
          );
        break;
      default:
        res.json({
          code: 0,
          msg: "Invalid Login Type",
          result: {}
        });
    }
  },
  forget_password: (req, res) => {
    var newPassword = Math.random()
      .toString(36)
      .substr(2, 6);
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        if (user.password != undefined) {
          var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: config.env.email,
              pass: config.env.password
            }
          });
          var mailOptions = {
            from: config.env.email,
            to: req.body.email,
            subject: "Forget Password",
            text: `your New password is ${newPassword} . \r\n for security purpose change it asap`
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return res.json({
                code: 0,
                message: error,
                result: {}
              });
            } else {
              User.updateOne(
                { email: req.body.email },
                { $set: { password: bcrypt.hashSync(newPassword) } }
              )
                .then(update => {
                  if (update) {
                    return res.json({
                      code: 1,
                      msg: "Email sent",
                      result: {}
                    });
                  } else {
                    return res.json({
                      code: 0,
                      msg: "server error",
                      result: {}
                    });
                  }
                })
                .catch(err => {
                  res.json({
                    code: 0,
                    msg: "somethings went wrong",
                    result: {}
                  });
                });
            }
          });
        } else {
          return res.json({
            code: 0,
            msg: "You were loged in by Facebook",
            result: {}
          });
        }
      } else {
        return res.json({
          code: 0,
          message: "Email does not exist",
          result: {}
        });
      }
    });
  },
  change_password: (req, res) => {
    if (req.body.user_id != " ") {
      User.findOne({ _id: req.body.user_id })
        .then(user => {
          if (user) {
            var pass = bcrypt.compareSync(req.body.old_password, user.password);
            if (pass) {
              User.updateOne(
                { _id: req.body.user_id },
                { $set: { password: bcrypt.hashSync(req.body.new_password) } }
              ).then(update => {
                if (update) {
                  return res.json({
                    code: 1,
                    message: "Password updated successfully",
                    result: {}
                  });
                } else {
                  return res.json({
                    code: 0,
                    message: "There are some errors",
                    result: {}
                  });
                }
              });
            } else {
              return res.json({
                code: 0,
                message: "Old Password is wrong",
                result: {}
              });
            }
          } else {
            return res.json({
              code: 0,
              message: "User does not exist",
              result: {}
            });
          }
        })
        .catch(err =>
          res.json({
            code: 0,
            msg: "invalid credantials",
            result: {}
          })
        );
    } else {
      return res.json({
        code: 0,
        message: "User id must be there",
        result: {}
      });
    }
  },
  profile: (req, res) => {
    User.findById(req.params.user_id)
      .then(profile => {
        if (profile) {
          return res.json({
            code: 1,
            msg: "User's Profile",
            result: {
              name: profile.name,
              email: profile.email,
              country: profile.country,
              profileImg: profile.profileImg
            }
          });
        } else {
          return res.json({
            code: 0,
            msg: "Profile not found",
            result: {}
          });
        }
      })
      .catch(err =>
        res.json({
          code: 0,
          msg: "Invalid User_ID",
          result: {}
        })
      );
  },
  update_profile: (req, res) => {
    User.findOne({ _id: req.body.user_id })
      .then(profile => {
        if (profile) {
          const updatePro = {};
          if (req.body.name) updatePro.name = req.body.name;
          if (profile.email == "" && req.body.email)
            updatePro.email = req.body.email;
          if (req.body.country) updatePro.country = req.body.country;
          if (req.file)
            updatePro.profileImg = req.file.path.replace(/\\/gi, "/");
          User.findOneAndUpdate(
            { _id: req.body.user_id },
            {
              $set: updatePro
            },
            { new: true }
          ).then(update => {
            res.json({
              code: 1,
              msg: "Profile successfully Updated",
              result: update
            });
          });
        } else {
          return res.json({
            code: 0,
            msg: "Profile does not found",
            result: {}
          });
        }
      })
      .catch(err => {
        res.json({
          code: 0,
          msg: "Invalid User ID",
          result: {}
        });
      });
  },
  songs: (req, res) => {
    Songs.find()
      .then(songs => {
        if (songs) {
          return res.json({
            code: 1,
            msg: "songs",
            result: songs
          });
        } else {
          return res.json({
            code: 0,
            msg: "no songs find",
            result: {}
          });
        }
      })
      .catch(err => {
        return res.json({
          code: 0,
          msg: "something went wrong",
          result: {}
        });
      });
  }
};
