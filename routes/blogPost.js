// routes/blogPosts.js
const express = require('express');
const BlogPost = require('../models/blog');
const auth = require('../middleware/auth');
const User = require('../models/user');
const router = express.Router();
const multer = require('multer');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // save files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // create unique file names
  }
});

const upload = multer({ storage: storage });



// Get All Blog Posts
router.get('/', async (req, res) => {
  const blogPosts = await BlogPost.find().populate('author', 'username');
  res.send(blogPosts);
});

// Get Single Blog Post
router.get('/:id', async (req, res) => {
  const blogPost = await BlogPost.findById(req.params.id).populate('author', 'username');
  if (!blogPost) return res.status(404).send({ error: 'Blog post not found' });
  res.send(blogPost);
});

// Create New Blog Post
router.post('/newBlog', auth, upload.array('images', 10), async (req, res) => {
  const { title, content} = req.body;
  const images = req.files.map(file => file.path); // get paths of uploaded images
  const newBlogPost = new BlogPost({ title, content, image: images, author: req.user._id });
  
  try {
    await newBlogPost.save();
    res.status(201).send(newBlogPost);
  } catch (error) {
    res.status(400).send({ error: 'Error creating blog post' });
  }
});

// Update Blog Post
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  const { title, content} = req.body;
  const images = req.files.map(file => file.path); // Get paths of uploaded images
  
  const blogPost = await BlogPost.findById(req.params.id);
  if (!blogPost) return res.status(404).send({ error: 'Blog post not found' });
  
  if (blogPost.author.toString() !== req.user._id.toString()) return res.status(403).send({ error: 'Unauthorized' });

  blogPost.title = title;
  blogPost.content = content;
  blogPost.image = images;

  try {
    await blogPost.save();
    res.send(blogPost);
  } catch (error) {
    res.status(400).send({ error: 'Error updating blog post' });
  }
});



// Delete Blog Post
router.delete('/:id', auth, async (req, res) => {
  const blogPost = await BlogPost.findById(req.params.id);
  console.log(blogPost);
  if (!blogPost) return res.status(404).send({ error: 'Blog post not found' });

  if (blogPost.author.toString() !== req.user._id.toString()) return res.status(403).send({ error: 'Unauthorized' });

  try {
    await BlogPost.deleteOne({ _id: req.params.id });
    res.send({ message: 'Blog post deleted' });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: 'Error deleting blog post' });
  }
});
  
module.exports = router;
