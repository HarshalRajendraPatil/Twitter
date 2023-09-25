// Making a GET request to the '/api/posts' which gets all the posts from the database.
$.get("/api/posts", (results) => {
  // Uses the outputPosts function to create html for the incoming data from the server
  outputPosts(results, $(".postsContainer"));
});

// function which reacts html for the each element of the incoming array
function outputPosts(results, container) {
  // Clears every thing in the container
  container.html("");

  // Checks for the the existance of the post if its empty
  if (results.length == 0) {
    return container.append("<span class='noResults'>Nothing to show</span>");
  }

  // uses the createPostHtml function to generate html for each post in the database
  results.forEach((result) => {
    const html = createPostHtml(result);
    container.append(html);
  });
}
