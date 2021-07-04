const express = require("express");
const { check } = require("express-validator");

const placeControllers = require("../controllers/places-controller");
const router = express.Router();
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

router.get("/:pid", placeControllers.getPlacesById);

router.get("/user/:uid", placeControllers.getPlacesByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  //validation here for creating a new place
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placeControllers.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placeControllers.updatePlace
);
router.delete("/:pid", placeControllers.deletePlace);

module.exports = router;
