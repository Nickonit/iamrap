const Router = require("express").Router();
var connection = require("../../config/database");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "audio/wav" ||
    file.mimetype === "audio/wave" ||
    file.mimetype === "audio/mp3" ||
    file.mimetype === "audio/mpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 20
  },
  fileFilter
});

const userController = require("../controllers/registerController");
const adminController = require("../../admin_panal/controllers/admin");
Router.post("/register", upload.single("profileImg"), userController.register);
Router.post("/login", upload.single("profileImg"), userController.login);
Router.post("/forget_password", userController.forget_password);
Router.post("/change_password", userController.change_password);
Router.post(
  "/update_profile",
  upload.single("profileImg"),
  userController.update_profile
);
Router.post(
  "/admin/register",
  upload.single("profileImg"),
  adminController.register
);
Router.post("/admin/login", adminController.login);
Router.post("/admin/forget_password", adminController.forget_password);
Router.post("/admin/change_password", adminController.change_password);
Router.post("/admin/songs", upload.array("songFile", 2), adminController.songs);
Router.post("/admin/current", adminController.current);
Router.get("/profile/:user_id", userController.profile);
Router.get("/songs", userController.songs);

module.exports = Router;
