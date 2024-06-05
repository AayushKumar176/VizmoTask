// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Blog = require('../models/blog');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  
  try {
    await newUser.save();
    res.status(201).send({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
    const { id } = req.body;
  
    try {
      // Search for a user in the database based on the provided id
      const user = await User.findOne({ id });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Create a JWT token with a one-day expiry
      const token = jwt.sign({ id: user._id}, process.env.SECRET_KEY, {
        expiresIn: '1d',
      });
  
      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  router.get('/filter', async (req, res) => {
    const { title, author } = req.query;
    let filter = {};
  
    // If the title is present, add it to the filter
    if (title) {
      filter.title = new RegExp(title, 'i'); // case-insensitive regex search
    }
  
    // If the author is present, find the user by username and add their ID to the filter
    if (author) {
      try {
        const user = await User.findOne({ username: author });
        if (user) {
          filter.author = user._id;
        } else {
          return res.status(404).send({ error: 'Author not found' });
        }
      } catch (error) {
        return res.status(500).send({ error: 'Error finding author' });
      }
    }
  
    // Fetch and return the filtered blog posts
    try {
      const blogPosts = await Blog.find(filter).populate('author', 'username');
      res.send(blogPosts);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Error retrieving blog posts' });
    }
  });
  
module.exports = router;
