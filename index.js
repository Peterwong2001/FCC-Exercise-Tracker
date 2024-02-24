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



const connectDB = "mongodb+srv://user1:"+ process.env.PASSWORD + "@cluster0.ofgm2es.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(connectDB, {useNewUrlParser: true, useUnifiedTopology: true});

let exerciseTrackerSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
  _id: String,
  count: Number
})

let exerciseTracker = mongoose.model("exerciseTracker", exerciseTrackerSchema);

let resObj = {};


app.get("/api/users", function(res, req) {
  res.json(resObj);
})