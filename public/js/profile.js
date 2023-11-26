$(document).ready(() => {
  if (selectedTab == "replies") {
    loadReplies();
  } else {
    loadPosts();
  }
});

function loadPosts() {
  $.get(
    "/api/posts",
    { postedBy: profileUserId, isReply: false },
    (results) => {
      // Uses the outputPosts function to create html for the incoming data from the server
      outputPosts(results, $(".postsContainer"));
    }
  );
}

function loadReplies() {
  $.get("/api/posts", { postedBy: profileUserId, isReply: true }, (results) => {
    // Uses the outputPosts function to create html for the incoming data from the server
    outputPosts(results, $(".postsContainer"));
  });
}
