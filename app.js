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

