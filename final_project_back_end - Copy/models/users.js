const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  //image here talks about the URL, it isn't storing a file in the database
  image: { type: String },
  places: [{ type: mongoose.Types.ObjectId, ref: `Place` }],
});
//ref establishes the relationship between the two schemas. the array is put around places because one user can have many places

//can only create a new user if the email isn't already used, this 3rd party package takes care of that
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
