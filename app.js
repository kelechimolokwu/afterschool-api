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

// Get Lessons
// app.get('/collection/:collectionName', (req, res, next) => {
//     req.collection.find({}).toArray((e, results) => {
//         if (e) return next(e)
//         res.send(results)
//     })
// });

app.get('/collection/:collectionName', async function (req, res, next) {
    await req.collection.find().toArray((e, results) => {
      if (e) return next(e)
      res.json(results)
    })
  });

// retrieve an object by mongodb ID
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne(
        { _id: new ObjectID(req.params.id) },
        (e, result) => {
            if (e) return next(e)
            res.send(result)
}) })

// Insert JSON Object to MongoDB - Add an Order
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (e, results) => {
        if (e) return next(e);
        console.log(results);
        res.json(results)
    })
})

// Update lesson by ID
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.updateOne(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            console.log(result)
            if (e) return next(e)
            res.send((result.modifiedCount === 1) ? 
                { msg: 'success' } : { msg: 'error' })
        })
})


// Perform text search
// GET request for search
// app.get('/collection/:collectionName/:query', (req, res, next) => {

//     // passing the query as a parameter
//     const query = {"$or": [
//         {'subject': {'$regex': req.params.query, '$options': 'i'}},
//         {'location': {'$regex': req.params.query, '$options': 'i'}}
// ]};

app.get('/search/:collectionName', async function (req, res, next) {
    await req.collection.find({ $text: { $search: req.query.query }  })
    .toArray((err, results) => {
      res.json(results)
      if (err) return next(err)
    })
  })

// // displaying results
// req.collection.find(query).toArray((e, results) => {
//     if (e) return next(e)
//     res.send(results)
// })


// Wrong route 404 error page
app.use(function (req, res) {
    // Sets the status code to 404
    res.status(404);
    // Sends the error "File not found!”
    res.send("File not found!");
});

// Listen to port
app.listen(port, function () {
    console.log(`Server running at http://localhost:${port}`);
});