const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

//options is a standard header that is attached by the browser to all methods that aren't get methods

module.exports = (req, resp, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error(`authentication failed`);
    }
    const decodedToken = jwt.verify(token, "supersecretcode");
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    if (!token) {
      const error = new HttpError(`invalid token`, 401);
      return next(error);
    }
  }
};
