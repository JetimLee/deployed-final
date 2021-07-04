const express = require("express");

const usersController = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");
const router = express.Router();

router.get("/", usersController.getUsers);

router.post("/signup", fileUpload.single("image"), usersController.signUp);
router.post("/login", usersController.login);

module.exports = router;
