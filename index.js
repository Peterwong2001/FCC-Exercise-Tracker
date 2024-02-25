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
  id: {type: String, required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: String
})

let userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  log: [exerciseTrackerSchema]
})



let User = mongoose.model("User", userSchema);
let Tracker = mongoose.model("Tracker", exerciseTrackerSchema);


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
  User.find({}, function(err, list) {
    if(!err) {
      res.json(list)
    }
  })
})

mongoose.set('useFindAndModify', false);

// to submit and save details
app.post("/api/users/:_id/exercises", bodyParser.urlencoded({ extended: false }), function(req, res) {
  let userId = req.params._id;
  let newTracker = new Tracker({
    id: req.body._id,
    date: req.body.date,
    duration: parseInt(req.body.duration),
    description: req.body.description 
  })
  
  if(newTracker.date === "") {
    newTracker.date = new Date().toISOString().substring(0, 10)
      //.toDateString()
  }
  User.findByIdAndUpdate(
    userId,
    //userId
    {$push: {log: newTracker}},
    {new: true},
    function(err, update) {
      if (!err) {
        resObj["_id"] = update.id
        resObj["username"] = update.username
        resObj["description"] = newTracker.description
        resObj["duration"] = newTracker.duration
        resObj["date"] = new Date(newTracker.date).toDateString()
        res.json(resObj)
        
      }
      console.log(req.body.id);
    }
  )
})

// get request to retrieve full exercise log of user
app.get("/api/users/:_id/logs?", function(req, res) {
  let userid = req.params._id
  
  console.log("req query = ", req.query.userid);
  
  User.findById(req.params._id, function(err, result) {
    if(!err) {
      let responseObj = {}
      
      if(req.query.from || req.query.to) {
        let fromDate = new Date(0)
        let toDate = new Date()
        
        if(req.query.from) {
          fromDate = new Date(req.query.from)
        }
        fromDate = fromDate.getTime()
        toDate = toDate.getTime()
        
        responseObj.log = responseObj.log.filter(function(tracker) {
          let trackerDate = new Date(tracker.date).getTime().toDateString()
          
          return trackerDate >= fromDate && trackerDate <= toDate
        })
      }
      
      if (req.query.limit) {
        responseObj.log = responseObj.log.slice(0, req.query.limit)
      }
      
      responseObj["_id"] = userid
      responseObj["username"] = result.username
      responseObj["count"] = result.log.length
      responseObj["log"] = result.log.map(a => ({
        description: a.description,
        duration: a.duration,
        date: new Date(a.date).toDateString()
      }))
      
      
      res.json(responseObj)
      
    }
  })
  
})


