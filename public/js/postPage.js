// Making a GET request to the '/api/posts' which gets all the posts from the database.
$.get("/api/posts/" + postId, (results) => {
  // Uses the outputPosts function to create html for the incoming data from the server
  outputPostsWithReplies(results, $(".postsContainer"));
});
