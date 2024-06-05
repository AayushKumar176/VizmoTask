require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');
const blogPost= require('./routes/blogPost');

const app = express();

app.use(bodyParser.json());


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/user', userRoute);
app.use('/blogPost', blogPost);
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

mongoose
  .connect(
    process.env.MONGO_URI
  )
  .then(() => {
    console.log("Database connected");
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });