const multer = require("multer");
const uuid = require("uuid").v1;

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const extenstion = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + "." + extenstion);
    },
  }),
  fileFilter: (req, file, cb) => {
    //the double !! turns isValid into a true/false, the cb will send the error if there is one along with the true/false from isValid
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error(`invalid mimetype!`);
    cb(error, isValid);
  },
});

module.exports = fileUpload;
