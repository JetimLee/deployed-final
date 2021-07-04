const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");
const getCoordinates = require("../util/Location");
const mongoose = require("mongoose");
const fs = require("fs");

const Place = require("../models/places");

const HttpError = require("../models/http-error");
const User = require("../models/users");

// let fake_places = [
//   {
//     id: "p1",
//     title: `empire state building`,
//     description: `one of the most famous skyscrapers in the world`,
//     location: {
//       lat: 40,
//       lng: -73,
//     },
//     address: `20 w 34th st, new york, ny 10001`,
//     creator: "u3",
//   },
//   {
//     id: "p1",
//     title: `empire state building`,
//     description: `one of the most famous skyscrapers in the world`,
//     location: {
//       lat: 40,
//       lng: -73,
//     },
//     address: `20 w 34th st, new york, ny 10001`,
//     creator: "u3",
//   },
// ];

const getPlacesById = async (req, resp, next) => {
  //   console.log(`working`);
  console.log(req.params.pid);
  const placeId = req.params.pid;
  let places;
  //this will throw an error if the get request has a problem
  try {
    places = await Place.findById(placeId);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      `Something went wrong when finding the place id!`,
      500
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError(
        `could not find places with the passed in id of ${placeId}`,
        404
      )
    );
  } else {
    //this gets rid of the need to put an _ in the id in the url
    resp.json({ places: places.toObject({ getters: true }) });
  }
};

const getPlacesByUserId = async (req, resp, next) => {
  //   console.log(`working`);
  //   resp.send("hello");
  console.log(req.params.uid);
  console.log(`getting places by user id! ${req.params.uid}`);
  const userId = req.params.uid;
  let creator;
  try {
    creator = await Place.find({ creator: userId });
  } catch (err) {
    console.log(`an error occurred with the user id ${err}`);
    const error = new HttpError(
      `something went wrong when getting the user id!`,
      500
    );
    return next(error);
  }

  // const creator = fake_places.filter((user) => {
  //   return user.creator === userId;
  // });
  if (!creator || creator.length === 0) {
    return next(
      new HttpError(
        `could not find a user with the matching id of ${userId}`,
        404
      )
    );
  } else {
    resp.json({
      creator: creator.map((el) => el.toObject({ getters: true })),
    });
  }
};

const createPlace = async (req, resp, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    next(new HttpError(` an error occurred, please check data`, 422));
  }
  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordinates(address);
  } catch (error) {
    return next(error);
  }
  const createdPlace = new Place({
    title,
    description,
    image: req.file.path,
    location: coordinates,
    address,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    const err = new HttpError(
      `Something went wrong when created the place, try again!`,
      500
    );
    return next(err);
  }
  //if the check is successful

  if (!user) {
    const err = new HttpError(`Could not find user with the provided id!`, 404);
    return next(err);
  }
  console.log(user);
  //can store or create a user depending on a few things from this point on
  //save returns a promise, its an async task
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ sess: session });
    user.places.push(createdPlace);
    await user.save({ sess: session });
    await session.commitTransaction();
  } catch (err) {
    //if this happens the datbase is down or some validation errored
    const error = new HttpError(`Something failed when creating place!`, 500);
    console.log(err);
    return next(error);
  }
  resp.json(201).json({ place: createdPlace });
};

const updatePlace = async (req, resp, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(HttpError(`an error occurred, please check data`, 422));
  }
  //the data i am expecting is up to me, i could add more here
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError(
      `something went wrong in updating the place`,
      500
    );
    return next(err);
  }
  if (place.creator.toString() !== req.userData.userId) {
    const err = new HttpError(`cannot update this place`, 401);
    return next(err);
  }

  place.title = title;
  place.description = description;
  //   updatedPlace.creator = creator - was testing
  try {
    await place.save();
  } catch (error) {
    const err = new HttpError(
      `something went wrong, couldn't save the place!`,
      500
    );
    return next(err);
  }

  resp.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, resp, next) => {
  const placeId = req.params.pid;
  console.log(`here is id ${placeId}`);
  console.log(`deleting`);

  let place;
  try {
    console.log(`entering first try block`);
    //populate allows you to work with data stored in another collection
    //references must be established in the schemas for this to work
    place = await Place.findById(placeId).populate("creator");
    console.log(place);
  } catch (error) {
    console.log(`entering error of first try block`);
    console.log(error);
    const err = new HttpError(
      `an issue occurred when deleting a place over here`,
      500
    );
    return next(err);
  }
  if (!place) {
    const err = new HttpError(`no place was found!`, 404);
    return next(err);
  }

  if (place.creator.id !== req.userData.userId) {
    const err = new HttpError(
      `you don't have permission to delete this place!`,
      401
    );
    return next(err);
  }

  const imagePath = place.image;

  try {
    console.log(`entering second try block`);
    //similar to save, except this removes the place by its id
    const session = await mongoose.startSession();
    session.startTransaction();

    await place.remove({ sess: session });
    place.creator.places.pull(place);
    await place.creator.save({ sess: session });
    await session.commitTransaction();
  } catch (error) {
    console.log(`entered error of second try block`);
    const err = new HttpError(`an issue occurred when deleting a place`, 500);
    console.log(error);
    return next(err);
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  resp.status(200).json({ message: `deleted place with id of ${placeId}` });
  console.log(`success`);
};
exports.getPlacesById = getPlacesById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
