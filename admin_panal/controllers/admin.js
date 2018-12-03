const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const nodemailer = require("nodemailer");
const router = require("express").Router();
const Admin = require("../models/Admin");
const Song = require("../models/Song");
let connection = require("../../config/database");
const config = require("../../config/config.json");

module.exports = {
  register: (req, res) => {
    Admin.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return res.status(400).json({ massage: "email already exist" });
      } else {
        const newUser = new Admin({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          image:
            req.file === undefined ? " " : req.file.path.replace(/\\/gi, "/")
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.status(200).json({ user }))
              .catch(err =>
                res.status(400).json({ massage: "something went wrong" })
              );
          });
        });
      }
    });
  },

  login: (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    Admin.findOne({ email }).then(user => {
      if (!user) {
        return res.status(404).json({ massage: "Invalid Email" });
      }
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          const payload = {
            id: user.id,
            username: user.username,
            email: user.email
          };
          jwt.sign(
            payload,
            config.env.secrate,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          return res.status(400).json({ massage: "something went wrong" });
        }
      });
    });
  },

  forget_password: (req, res) => {
    let newPassword = Math.random()
      .toString(36)
      .substr(2, 6);
    Admin.findOne({ email: req.body.email })
      .exec()
      .then(users => {
        if (users) {
          var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "ripenappstesting@gmail.com",
              pass: "ripenapps@123"
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          var mailOptions = {
            from: "ripenappstesting@gmail.com",
            to: req.body.email,
            subject: "Forget Password",
            text: `your New password is ${newPassword} . \r\n for security purpose change it asap`
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return res.status(400).json({ massage: "Invalid Credentials!!" });
            } else {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newPassword, salt, (err, hash) => {
                  if (err) throw err;
                  newPassword = hash;
                  Admin.updateOne(
                    { email: req.body.email },
                    { $set: { password: newPassword } }
                  )
                    .then(users => {
                      return res.status(400).json({
                        massage:
                          "We have send an email please check your mail account"
                      });
                    })
                    .catch(err => {
                      return res
                        .status(400)
                        .json({ massage: "Invalid Credentials" });
                    });
                });
              });
            }
          });
        } else {
          return res.status(400).json({ massage: "Email does not exist" });
        }
      });
  },

  change_password: (req, res) => {
    let newPassword = req.body.newPassword;
    Admin.findOne({ email: req.body.email }).then(users => {
      if (users) {
        var pass = bcrypt.compare(req.body.oldPassword, users.password);
        if (pass) {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newPassword, salt, (err, hash) => {
              if (err) throw err;
              newPassword = hash;
              Admin.updateOne(
                { email: req.body.email },
                { $set: { password: newPassword } }
              ).then(update => {
                if (update) {
                  res.status(200).json({
                    data: {
                      code: 1,
                      message: "password updated successfully",
                      result: {}
                    }
                  });
                } else {
                  return res
                    .status(400)
                    .json({ massage: "something went wrong" });
                }
              });
            });
          });
        } else {
          return res.status(400).json({ massage: "Old Password is wrong" });
        }
      } else {
        return res.status(400).json({ massage: "User not exist" });
      }
    });
  },

  songs: (req, res) => {
    let path = req.files.map(item => item.path);
    let newSong = {
      title: req.body.title,
      artistName: req.body.artistName,
      image: path[0],
      songFile: path[1]
    };
    // console.log(req.files);
    newSong = new Song(newSong);
    newSong
      .save()
      .then(songsList => {
        return res
          .status(400)
          .json({ massage: "song Uploaded", result: songsList });
      })
      .catch(err => {
        return res.status(400).json({ massage: "something went wrong" });
      });
  },
  current: (req, res) => {
    Admin.find({ email: req.body.email }).then(user => {
      if (user) {
        return res.status(200).json({
          id: user.user_id,
          username: user.username,
          email: user.email
        });
      }
    });
  }
};
