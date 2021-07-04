const uuid = require("uuid").v4;
const HttpError = require("../models/http-error");
const User = require("../models/users");
const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// const fake_users = [
//   {
//     id: "u3",
//     name: "gavin",
//     email: "test@test.com",
//     password: "password",
//   },
// ];
const getUsers = async (req, resp, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    const err = new HttpError(`getting users failed, please try again!`, 500);
    return next(err);
  }
  resp.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signUp = async (req, resp, next) => {
  const { name, email, password } = req.body;
  console.log(name);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(`invalid inputs put in, please check!`, 422));
  }
  let userExists;
  try {
    userExists = await User.findOne({ email: email });
    console.log(userExists);
  } catch (error) {
    const err = new HttpError(`something went wrong when signing up!`, 500);
    console.log(`error happened at finding user`);
    return next(err);
  }
  //this will be thrown only if the userExists, otherwise it will be possible to create a new user
  if (userExists) {
    const error = new HttpError(`User exists already, please login!`, 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcryptjs.hash(password, 12);
  } catch (error) {
    const err = new HttpError(`could not create the user!`, 500);
    return next(err);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });
  try {
    await createdUser.save();
  } catch (err) {
    res.status(500).json({
      message: "Signing up failed, please try again.",
      error: error,
    });
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecretcode",
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError(`sign up failed, please try again!`, 500);
    return next(err);
  }

  resp
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, resp, next) => {
  console.log(`login ${req.body}`);
  const { email, password } = req.body;

  let userExists;

  try {
    userExists = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError(`something went wrong when logging in!`, 500);
    console.log(`error happened at finding user`);
    return next(err);
  }
  if (!userExists) {
    const err = new HttpError(`invalid credentials, try again!`, 401);
    return next(err);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcryptjs.compare(password, userExists.password);
  } catch (error) {
    const err = new HttpError(
      "an error occurred when logging in, try again!",
      500
    );
    return next(err);
  }
  //jwt logic here
  let token;
  try {
    token = jwt.sign(
      { userId: userExists.id, email: userExists.email },
      "supersecretcode",
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError(`logging in failed, please try again!`, 500);
    return next(error);
  }

  if (!isValidPassword) {
    const err = new HttpError(
      "invalid credentials, could not log you in!",
      401
    );
    return next(err);
  }

  resp.status(200).json({
    userId: userExists.id,
    email: userExists.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
