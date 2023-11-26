$(document).ready(() => {
  if (selectedTab == "followers") {
    loadFollowers();
  } else {
    loadFollowing();
  }
});

function loadFollowers() {
  $.get(`/api/users/${profileUserId}/followers`, (results) => {
    // Uses the outputPosts function to create html for the incoming data from the server
    outputUser(results.followers, $(".resultsContainer"));
  });
}

function loadFollowing() {
  $.get(`/api/users/${profileUserId}/following`, (results) => {
    // Uses the outputUser function to create html for the incoming data from the server
    outputUser(results.following, $(".resultsContainer"));
  });
}

function outputUser(results, container) {
  container.html("");

  // Creates every user div that is follower or being followed
  results.forEach((result) => {
    var html = createUserHtml(result, true);
    container.append(html);
  });

  // Outputs when there is no followings and followers
  if (results.length == 0) {
    container.append(`<div class="noResults">No Results found</div>`);
  }
}

function createUserHtml(userData, showFollowButton) {
  const name = userData.firstName + " " + userData.lastName;
  const isFollowing =
    userLoggedIn.following && userLoggedIn.following.includes(userData._id);
  const text = isFollowing ? "Following" : "Follow";
  const buttonClass = isFollowing ? "followButton following" : "followButton";

  // Creating the button for follow or unfollow in the following for followers section
  let followButton = "";

  if (showFollowButton && userLoggedIn._id !== userData._id) {
    followButton = `<div class="followButtonContainer">
      <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
    </div>`;
  }

  // html for outputing user that are followers or being followed
  return `<div class="user">
    <div class="userImageContainer">
      <img src=${userData.profilePic}>
    </div> 
    <div class="userDetailsContainer">
      <div class="header">
        <a href="/profile/${userData.username}">${name}</a>
        <span class="username">@${userData.username}</span>
      </div>
    </div>  
    ${followButton}      
  </div>`;
}
