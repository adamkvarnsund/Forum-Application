const express = require('express'); // Import the Express.js library
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const fs = require('fs'); // File system module

const app = express(); // Create an Express application
const PORT = 3000; // Set the server's port

app.use(bodyParser.json()); // Configure Express to use JSON body parsing

app.use(express.static('public')); // Serve static files from the 'public' directory
app.use('/src', express.static('src')); // Serve static files from the 'src' directory

let forumData = { posts: [] }; // Initialize an empty data structure for forum posts

// Check if a JSON file ('data.json') exists and load its data if available
if (fs.existsSync('data.json')) {
  forumData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
}

// Function to save the forum data to a JSON file
function saveDataToFile() {
  fs.writeFileSync('data.json', JSON.stringify(forumData, null, 2), 'utf-8');
}

// Define routes and handlers for different API endpoints:

// Get all posts
app.get('/api/posts', (req, res) => {
  res.json(forumData.posts);
});

// Create a new post
app.post('/api/posts', (req, res) => {
  const post = req.body;
  if (post) {
    // Create a new post object with an ID, date, and comments array
    const date = new Date();
    const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const newPost = {
      id: forumData.posts.length + 1,
      header: post.header,
      content: post.content,
      date: currentDate,
      comments: [],
    };
    forumData.posts.push(newPost); // Add the new post to the data
    saveDataToFile(); // Save the updated data to the JSON file
    res.json(newPost); // Respond with the created post
  } else {
    res.status(400).json({ error: 'Invalid post data' });
  }
});

// Edit a post
app.put('/api/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const newContent = req.body.content;

  // Find the post with the given ID
  const post = forumData.posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Update the post's content
  post.content = newContent;
  saveDataToFile(); // Save the updated data to the JSON file

  res.json(post); // Respond with the updated post
});

// Delete a post
app.delete('/api/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);

  // Find the index of the post with the given ID
  const postIndex = forumData.posts.findIndex((p) => p.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Remove the post from the data
  forumData.posts.splice(postIndex, 1);
  saveDataToFile(); // Save the updated data to the JSON file

  res.status(204).send(); // Respond with a 204 status (No Content)
});

// Add a comment to a post
app.post('/api/posts/:postId/comments', (req, res) => {
  const postId = parseInt(req.params.postId);
  const commentContent = req.body.content;

  // Find the post with the given ID
  const post = forumData.posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Create a new comment
  const newComment = {
    id: post.comments.length + 1,
    content: commentContent,
  };
  post.comments.push(newComment); // Add the new comment to the post's comments
  saveDataToFile(); // Save the updated data to the JSON file

  res.json(newComment); // Respond with the created comment
});

// Edit a comment
app.put('/api/posts/:postId/comments/:commentId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const commentId = parseInt(req.params.commentId);
  const newContent = req.body.content;

  // Find the post with the given ID
  const post = forumData.posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Find the comment with the given ID
  const comment = post.comments.find((c) => c.id === commentId);

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  // Update the comment's content
  comment.content = newContent;
  saveDataToFile(); // Save the updated data to the JSON file

  res.json(comment); // Respond with the updated comment
});

// Delete a comment
app.delete('/api/posts/:postId/comments/:commentId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const commentId = parseInt(req.params.commentId);

  // Find the post with the given ID
  const post = forumData.posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Find the index of the comment with the given ID
  const commentIndex = post.comments.findIndex((c) => c.id === commentId);

  if (commentIndex === -1) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  // Remove the comment from the post's comments
  post.comments.splice(commentIndex, 1);
  saveDataToFile(); // Save the updated data to the JSON file

  res.status(204).send(); // Respond with a 204 status (No Content)
});

// Start the Express server on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
