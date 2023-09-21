const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use(express.static('public'));
app.use('/src', express.static('src'));

let forumData = { posts: [] };

if (fs.existsSync('data.json')) {
  forumData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
}

function saveDataToFile() {
  fs.writeFileSync('data.json', JSON.stringify(forumData, null, 2), 'utf-8');
}

// Get all posts
app.get('/api/posts', (req, res) => {
  res.json(forumData.posts);
});

// Create a new post
app.post('/api/posts', (req, res) => {
  const post = req.body;
  if (post) {
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
    forumData.posts.push(newPost);
    saveDataToFile();
    res.json(newPost);
  } else {
    res.status(400).json({ error: 'Invalid post data' });
  }
});

// Edit a post
app.put('/api/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const newContent = req.body.content;

  const post = forumData.posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  post.content = newContent;
  saveDataToFile();

  res.json(post);
});

// Delete a post
app.delete('/api/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);

  const postIndex = forumData.posts.findIndex((p) => p.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  forumData.posts.splice(postIndex, 1);
  saveDataToFile();

  res.status(204).send();
});

// Add a comment to a post
app.post('/api/posts/:postId/comments', (req, res) => {
  const postId = parseInt(req.params.postId);
  const commentContent = req.body.content;

  const post = forumData.posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const newComment = {
    id: post.comments.length + 1,
    content: commentContent,
  };
  post.comments.push(newComment);
  saveDataToFile();

  res.json(newComment);
});

// Edit a comment
app.put('/api/posts/:postId/comments/:commentId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const commentId = parseInt(req.params.commentId);
  const newContent = req.body.content;

  const post = forumData.posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const comment = post.comments.find((c) => c.id === commentId);

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  comment.content = newContent;
  saveDataToFile();

  res.json(comment);
});

// Delete a comment
app.delete('/api/posts/:postId/comments/:commentId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const commentId = parseInt(req.params.commentId);

  const post = forumData.posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const commentIndex = post.comments.findIndex((c) => c.id === commentId);

  if (commentIndex === -1) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  post.comments.splice(commentIndex, 1);
  saveDataToFile();

  res.status(204).send();
});

// Define other routes for editing and deleting posts/comments...

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
