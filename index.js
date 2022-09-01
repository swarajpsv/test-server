const express = require('express')
const app = express()
const port = 5373
const cir = require('circular-json')
const multer = require('multer')
const fs = require('fs')
let formidable = require('express-formidable');
let path = require('path');
const { resolveSoa } = require('dns')
let validSession = false;

app.use(formidable({
  encoding: 'utf-8',
  uploadDir: path.join(__dirname, 'uploads'),
  multiples: true,
  keepExtensions: true// req.files to be arrays of files
}));

app.get("/", (req, res) => {
    res.end("Hello World")
})

app.get("/test", (req, res) => {
  res.status(404)
  res.end("Hello World")
})

app.post('/auth', (req, res) => {
  validSession = true;
  console.log("\n\n\nSession Created");
  res.end();
})

// No Auth failure for FBC
app.get('/noAuth', (req, res) => {
  console.log('\n\n\nNo Auth')
  res.status(401)
  res.end('You are not authorized')
})

// Request Failure for FBC
app.post('/failure', (req, res) => {
  res.status(404)
  res.end('Resource Not Found')
})

// GET FOR FBC
app.get('/get', (req, res) => {
  if(validSession) {
    console.log("\n\n\nSession Valid");
    validSession = false;
    res.setHeader('Content-Type', 'application/json');
    res.end('GET Successful')
  }
  else {
    console.log("\n\n\nSession Not Valid: 401");
    res.status(401);
    res.end('Unauthorized Session');
  }
})

app.get('/fbcapp-web/fbcapp/get', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end('GET Successful')
})

//ASYNC GET FOR FBC
app.get('/asyncget', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end()
})

// POST FOR FBC
app.post('/post', (req, res) => {
  if(validSession) {
    console.log("\n\n\nSession: ", validSession);
    validSession = false;
    console.log(req.headers)
    res.setHeader('Content-Type', 'application/json');
    let postResponse = JSON.stringify({ 'Status': 'Success' })
    res.end(postResponse)
  }
  else {
    console.log("\n\n\nSession:",validSession);
    res.status(401);
    res.end('Unauthorized Session');
  }
})

// PUT FOR FBC
app.put('/put', (req, res) => {
  let headers = res.getHeaders()
  // console.log(headers)
  for(header in headers) {
    res.removeHeader(header)
  }
  res.setHeader('Entity', 'ICICI')
  res.setHeader('Content-Type', 'application/json');
  let putResponse = JSON.stringify({ 'Status': 'Success' })
  console.log(res.getHeaders())
  res.end(putResponse)
})

// PATCH FOR FBC
app.patch('/patch', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let patchResponse = JSON.stringify({ 'Status': 'Success' })
  res.end(patchResponse)
})

app.post('/getCar', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let patchResponse = JSON.stringify({ 'Status': 'ER00J10' })
  res.end(patchResponse)
})

// UPLOAD FOR FBC
app.post('/upload', (req, res) => {
  console.log("\n\n\n***** UPLOADING *****")
  res.setHeader('Content-Type', 'application/json');
  let uploadResponse = JSON.stringify({ 'Status': 'File Upload Successful' })
  res.end(uploadResponse)
})

// DOWNLOAD FOR FBC
app.get('/download', (req, res) => {
  console.log("\n\n\n\n\n\n\n***** SENDING FILE DATA TO CLIENT FOR DOWNLOADING *****\n\n\n\n")
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('fileName', 'download2.txt');
  fs.readFile('./test.txt', 'utf8', (err, data) => {
    res.end(data);
  })
})

app.post('/upload_movies', (req, res) => {
  console.log(`------ UPLOAD REQUEST FROM CLIENT ------
                ${req}`)
  
  let circularReqJson = cir.stringify(res)
  //let reqJson = JSON.parse(circularReqJson)

  fs.writeFile('./request.json', circularReqJson, (err) => {
    if(err) console.log("\n\n\nError while writing the multi-part request")
    else console.log("\n\n\nDone writing multi-part request")
  })

  res.send('Movies uploaded')
})

app.listen(port, 'localhost', () => {
    console.log(`app listening at http://localhost:${port}`)
})