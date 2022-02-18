const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const app = express()
// const bodyParser = require('body-parser');
const port = process.env.PORT || 3000

// Middleware
// Parser Middleware
app.use(express.json());
// app.use(bodyParser.json());

// CORS allows you to configure the web API's security. 
// Allows cross-domain API requests.
app.use(cors())

// Logger middleware
app.use(function (req, res, next) {
    console.log('Request IP: ' + req.url)
    console.log('Request date: ' + new Date())
    return next()
  })

// Static file middleware
app.use(function (req, res, next) {
    const filePath = path.join(__dirname, 'static', req.url)
    fs.stat(filePath, function (err, fileInfo) {
      if (err) return next()
      if (fileInfo.isFile()) res.sendFile(filePath)
      else next()
    })
  })

//Connect to MongoDB
const {MongoClient} = require("mongodb");
const ObjectID = require('mongodb').ObjectID;
const uri = "mongodb+srv://kelechimo:Vwe5bTTIpT7JXlYW@coursework-cst3145.0c0vq.mongodb.net/afterschool?retryWrites=true&w=majority";
let db;
MongoClient.connect(uri, (err, client) => {
    if(!err){
        db = client.db('afterschool');
    }else{
        console.log(err);
    }
});

// Parameters middleware
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next()
});

// Root Request Middleware
  app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages');
});

