const forumData = {
    posts: [],
};
// Function to toggle comments visibility
function toggleComments(postId) {
  const commentsDiv = document.getElementById(`comments_${postId}`);
  const showCommentsButton = document.getElementById(`showComments_${postId}`);

  if (commentsDiv.style.display === 'none' || commentsDiv.style.display === '') {
    commentsDiv.style.display = 'block';
    showCommentsButton.textContent = 'Hide Comments';
  } else {
    commentsDiv.style.display = 'none';
    showCommentsButton.textContent = 'Show Comments';
  }
}

async function renderPosts() {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) {
      throw new Error('Error fetching data');
    }
    const posts = await response.json();
    const postList = document.getElementById('postList');
    postList.innerHTML = '';

    // Check the sortOrder and sort the posts accordingly
    if (sortOrder === 'ascending') {
      posts.sort((a, b) => a.header.localeCompare(b.header));
    } else if (sortOrder === 'descending') {
      posts.sort((a, b) => b.header.localeCompare(a.header));
    }

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

      // Check if there's at least one comment to display
      if (commentCount > 0) {
        // Create a div to hold comments other than the last one
        const hiddenCommentsDiv = document.createElement('div');
        hiddenCommentsDiv.style.display = 'none'; // Initially hide this div
        hiddenCommentsDiv.className = 'hidden-comments';

        post.comments.forEach((comment, index) => {
          const commentDiv = document.createElement('div');
          commentDiv.className = 'comment';
          commentDiv.innerHTML = `
            <p><i class="comment-tag">Comment</i></p>
            <p id="comment_${comment.id}">${comment.content}</p>
            <button class="edit-comment-button" onclick="editComment(${post.id}, ${comment.id})">Edit</button>
            <button class="delete-comment-button" onclick="deleteComment(${post.id}, ${comment.id})">Delete</button>
          `;

          if (index === commentCount - 1) {
            // The last comment remains under the post
            commentsDiv.appendChild(commentDiv);
          } else {
            // Other comments go in the hidden div
            hiddenCommentsDiv.appendChild(commentDiv);
          }
        });

        if (commentCount > 1) {
          const showHiddenCommentsButton = document.createElement('paragraph');
          showHiddenCommentsButton.textContent = 'Show more comments' + " " + "(" + (commentCount-1) +")";
          showHiddenCommentsButton.className = 'show-comments-button';

          showHiddenCommentsButton.addEventListener('click', () => {
            if (hiddenCommentsDiv.style.display === 'none') {
              hiddenCommentsDiv.style.display = 'block';
              showHiddenCommentsButton.textContent = 'Hide Comments';
            } else {
              hiddenCommentsDiv.style.display = 'none';
              showHiddenCommentsButton.textContent = 'Show more comments' + " " + "(" + (commentCount-1) +")";
            }
          });

          commentsDiv.appendChild(showHiddenCommentsButton);
          commentsDiv.appendChild(hiddenCommentsDiv);
        }
      }

      postList.appendChild(postDiv);
    });
  } catch (error) {
    console.error('Error rendering posts:', error);
  }
}


function sortOrder() {
  const sortSelect = document.getElementById('sortSelect');
  const selectedValue = sortSelect.value;

  // Call renderPosts with the selected sorting order
  renderPosts(selectedValue);
}
async function addPost() {
  const postHeader = document.getElementById('postHeader').value;
  const postContent = document.getElementById('postContent').value;
  if (postContent && postHeader) {
    const post = {
      header: postHeader,
      content: postContent,
    };
    try {
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
      renderPosts();
      document.getElementById('postHeader').value = '';
      document.getElementById('postContent').value = '';
    } catch (error) {
      console.error('Error adding post:', error);
    }
  }
}

async function editPost(postId) {
  const newContent = prompt('Edit your post:');
  if (newContent !== null) {
    try {
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
      renderPosts();
    } catch (error) {
      console.error('Error editing post:', error);
    }
  }
}

async function deletePost(postId) {
  const confirmed = confirm('Are you sure you want to delete this post?');
  if (confirmed) {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error deleting post');
      }
      renderPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  }
}

async function addComment(postId) {
  const commentContent = prompt('Enter your comment:');
  if (commentContent) {
    const comment = {
      content: commentContent,
    };
    try {
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
      renderPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }
}

async function editComment(postId, commentId) {
  const newContent = prompt('Edit your comment:');
  if (newContent !== null) {
    try {
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
      renderPosts();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  }
}

async function deleteComment(postId, commentId) {
  const confirmed = confirm('Are you sure you want to delete this comment?');
  if (confirmed) {
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error deleting comment');
      }
      renderPosts();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }
}

// Initial rendering of posts
renderPosts();
