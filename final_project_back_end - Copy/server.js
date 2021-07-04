const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, resp, next) => {
  resp.setHeader("Access-Control-Allow-Origin", "*");
  resp.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization "
  );
  resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

// app.get("/", (req, resp) => {
//   resp.send("hello from node");
// });

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, resp, next) => {
  const error = new HttpError(`Could not find this route, sorry!`, 404);
  next(error);
});

//providing a middleware with 4 params will cause express to treat this as a special middleware function, it's an error handling middleware function
app.use((error, req, resp, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(`file deletion didn't work ${err}`);
    });
  }
  if (resp.headersSent) {
    return next(error);
  }
  resp
    .status(error.code || 500)
    .json({ message: error.message || `an unknown error occurred, sorry!` });
});

const PORT = process.env.PORT || 4002;

mongoose.set("useNewUrlParser", true);

const URL = `mongodb+srv://gavin:gavin123@cluster0.fe4dx.mongodb.net/final-prod?retryWrites=true&w=majority`;

mongoose
  .connect(URL, { useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server listening on ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
