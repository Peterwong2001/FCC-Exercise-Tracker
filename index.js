const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})



////////////////////


const connectDB = "mongodb+srv://user1:" + process.env.PASSWORD + "@cluster0.ofgm2es.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(connectDB, {useNewUrlParser: true, useUnifiedTopology: true});



let exerciseTrackerSchema = new mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: String
})

let userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  log: [exerciseTrackerSchema]
})



let User = mongoose.model("User", userSchema);
let ExerciseTracker = mongoose.model("Tracker", exerciseTrackerSchema);


let resObj = {};

// to submit and save new user
app.post("/api/users", bodyParser.urlencoded({ extended: false }), function(req, res) {
  let newUser = new User({username: req.body.username})
  newUser.save(function(err, saved) {
    if(!err) {
      resObj["username"] = saved.username
      resObj["_id"] = saved.id
      res.json(resObj)
    }
  })
})

// to get list of all users
app.get("/api/users", function(req, res) {
  User.find({})
      .exec(function(err, list) {
      if (!err) {
        res.json(list)
      }
  })
})

// to submit and save details
app.post("/api/users/:_id/exercises", bodyParser.urlencoded({ extended: false}), function(res, req) {
  let newTracker = new ExerciseTracker({
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date
  })
  if (newTracker.date === "") {
    newTracker.date = new Date().toISOString().toJSON().slice(0, 10);
  }
  User.findByIdAndUpdate(
    req.body.userId,
    {$push: {log: newTracker}},
    {new: true},
    function(err, updated) {
      if (!err) {
        resObj["_id"] = updated.id
        resObj["username"] = updated.username
        resObj["description"] = newTracker.description
        resObj["duration"] = newTracker.duration
        resObj["date"] = new Date(newTracker.date).toUTCString()
        res.json(resObj)
      }
    }
  )
})









