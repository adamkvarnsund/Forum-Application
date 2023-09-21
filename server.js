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

app.get('/api/posts', (req, res) => {
  res.json(forumData.posts);
});

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
// Route for editing a post
app.put('/api/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const newContent = req.body.content;

  // Find the post with the given ID
  const post = forumData.posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Update the post content
  post.content = newContent;
  saveDataToFile();

  // Return the updated post
  res.json(post);
});

// Route for deleting a post
app.delete('/api/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);

  // Find the index of the post with the given ID
  const postIndex = forumData.posts.findIndex((p) => p.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Remove the post from the array
  forumData.posts.splice(postIndex, 1);
  saveDataToFile();

  res.status(204).send();
});
// Route for adding a comment to a post
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
  post.comments.push(newComment);
  saveDataToFile();

  res.json(newComment);
});

// Route for editing a comment
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

  // Update the comment content
  comment.content = newContent;
  saveDataToFile();

  // Return the updated comment
  res.json(comment);
});

// Route for deleting a comment
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

  // Remove the comment from the array
  post.comments.splice(commentIndex, 1);
  saveDataToFile();

  res.status(204).send();
});

// Define other routes for editing and deleting posts/comments...

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
