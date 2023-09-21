// Data
const forumData = {
    posts: [],
  };
  
  // Function to toggle comments visibility
  function toggleComments(postId) {
    // Get references to the comments div and show/hide button by postId
    const commentsDiv = document.getElementById(`comments_${postId}`);
    const showCommentsButton = document.getElementById(`showComments_${postId}`);
  
    // Toggle the display property of commentsDiv and update the button text
    if (commentsDiv.style.display === 'none' || commentsDiv.style.display === '') {
      commentsDiv.style.display = 'block';
      showCommentsButton.textContent = 'Hide Comments';
    } else {
      commentsDiv.style.display = 'none';
      showCommentsButton.textContent = 'Show Comments';
    }
  }
  
  // Add an event listener to the sort dropdown menu
  const sortSelect = document.getElementById('sortSelect');
  
  let currentSortOrder = 'newest'; // Set the initial default sort order
  
  sortSelect.addEventListener('change', () => {
    const selectedValue = sortSelect.value;
    currentSortOrder = selectedValue; // Update the current sort order
    renderPosts(currentSortOrder);
  });
  
  // Function to render posts
  async function renderPosts(sortOrder) {
    try {
      // Fetch posts data from the server with the specified sort order
      const response = await fetch(`/api/posts?sort=${currentSortOrder}`);
      if (!response.ok) {
        throw new Error('Error fetching data');
      }
      const posts = await response.json();
  
      // Sort the posts array based on the selected sortOrder
      // Different sorting options: alphabetical, reverse-alphabetical, newest
      if (sortOrder === 'alphabetical') {
        posts.sort((a, b) => a.header.localeCompare(b.header));
      }
      if (sortOrder === 'reverse-alphabetical') {
        posts.sort((a, b) => a.header.localeCompare(b.header));
        posts.reverse();
      }
      if (sortOrder === 'newest') {
        posts.reverse();
      }
  
      // Get a reference to the postList element and clear its contents
      const postList = document.getElementById('postList');
      postList.innerHTML = '';
  
      // Iterate through the posts and create HTML elements for each post
      posts.forEach((post) => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
          <div class="post-info">
            <p class="post-date">${post.date}</p>
            <p class="post-header" id="post_${post.id}">${post.header}</p>
          </div>
          <p class="post-content" id="post_${post.id}">${post.content}</p>
          <button class="comment-button" onclick="addComment(${post.id})">Add Comment</button>
          <button class="edit-button" onclick="editPost(${post.id})">Edit Post</button>
          <button class="delete-button" onclick="deletePost(${post.id})">Delete Post</button>
          <div id="comments_${post.id}"></div>
        `;
  
        const commentsDiv = postDiv.querySelector(`#comments_${post.id}`);
        const commentCount = post.comments.length;
  
        // Check if there are comments to display
        if (commentCount > 0) {
          // Create a div to hold comments other than the last one
          const hiddenCommentsDiv = document.createElement('div');
          hiddenCommentsDiv.style.display = 'none'; // Initially hide this div
          hiddenCommentsDiv.className = 'hidden-comments';
  
          // Iterate through comments and create HTML elements for each
          post.comments.forEach((comment, index) => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.innerHTML = `
              <p><i class="comment-tag">Comment</i></p>
              <p id="comment_${comment.id}">${comment.content}</p>
              <button class="edit-comment-button" onclick="editComment(${post.id}, ${comment.id})">Edit</button>
              <button class="delete-comment-button" onclick="deleteComment(${post.id}, ${comment.id})">Delete</button>
            `;
  
            // Append comments to the appropriate div (last one under the post, others in hidden div)
            if (index === commentCount - 1) {
              commentsDiv.appendChild(commentDiv);
            } else {
              hiddenCommentsDiv.appendChild(commentDiv);
            }
          });
  
          // Show more comments button for posts with multiple comments
          if (commentCount > 1) {
            const showHiddenCommentsButton = document.createElement('paragraph');
            showHiddenCommentsButton.textContent = 'Show more comments' + " " + "(" + (commentCount - 1) + ")";
            showHiddenCommentsButton.className = 'show-comments-button';
  
            showHiddenCommentsButton.addEventListener('click', () => {
              if (hiddenCommentsDiv.style.display === 'none') {
                hiddenCommentsDiv.style.display = 'block';
                showHiddenCommentsButton.textContent = 'Hide Comments';
              } else {
                hiddenCommentsDiv.style.display = 'none';
                showHiddenCommentsButton.textContent = 'Show more comments' + " " + "(" + (commentCount - 1) + ")";
              }
            });
  
            commentsDiv.appendChild(showHiddenCommentsButton);
            commentsDiv.appendChild(hiddenCommentsDiv);
          }
        }
  
        postList.appendChild(postDiv); // Append the post to the postList
      });
    } catch (error) {
      console.error('Error rendering posts:', error);
    }
  }
  
  // Function to add a new post
  async function addPost() {
    // Get the post header and content from user input
    const postHeader = document.getElementById('postHeader').value;
    const postContent = document.getElementById('postContent').value;
    if (postContent && postHeader) {
      const post = {
        header: postHeader,
        content: postContent,
      };
      try {
        // Send a POST request to add the new post
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(post),
        });
        if (!response.ok) {
          throw new Error('Error adding post');
        }
        renderPosts(currentSortOrder); // Render posts with the current sort order
        document.getElementById('postHeader').value = '';
        document.getElementById('postContent').value = '';
      } catch (error) {
        console.error('Error adding post:', error);
      }
    }
  }
  
  // Function to edit a post
  async function editPost(postId) {
    const newContent = prompt('Edit your post:');
    if (newContent !== null) {
      try {
        // Send a PUT request to edit the post's content
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newContent }),
        });
        if (!response.ok) {
          throw new Error('Error editing post');
        }
        renderPosts(currentSortOrder); // Render posts with the current sort order
      } catch (error) {
        console.error('Error editing post:', error);
      }
    }
  }
  
  // Function to delete a post
  async function deletePost(postId) {
    const confirmed = confirm('Are you sure you want to delete this post?');
    if (confirmed) {
      try {
        // Send a DELETE request to delete the post
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Error deleting post');
        }
        renderPosts(currentSortOrder); // Render posts with the current sort order
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  }
  
  // Function to add a comment to a post
  async function addComment(postId) {
    const commentContent = prompt('Enter your comment:');
    if (commentContent) {
      const comment = {
        content: commentContent,
      };
      try {
        // Send a POST request to add a comment to the post
        const response = await fetch(`/api/posts/${postId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(comment),
        });
        if (!response.ok) {
          throw new Error('Error adding comment');
        }
        renderPosts(currentSortOrder); // Render posts with the current sort order
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  }
  
  // Function to edit a comment
  async function editComment(postId, commentId) {
    const newContent = prompt('Edit your comment:');
    if (newContent !== null) {
      try {
        // Send a PUT request to edit the comment's content
        const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newContent }),
        });
        if (!response.ok) {
          throw new Error('Error editing comment');
        }
        renderPosts(currentSortOrder); // Render posts with the current sort order
      } catch (error) {
        console.error('Error editing comment:', error);
      }
    }
  }
  
  // Function to delete a comment
  async function deleteComment(postId, commentId) {
    const confirmed = confirm('Are you sure you want to delete this comment?');
    if (confirmed) {
      try {
        // Send a DELETE request to delete the comment
        const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Error deleting comment');
        }
        renderPosts(currentSortOrder); // Render posts with the current sort order
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  }
  
  // Initial rendering of posts
  renderPosts();
  