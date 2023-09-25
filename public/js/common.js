// Enabling sumbit button only when uses has input some value in to the text area
$("#postTextarea").keyup((event) => {
  // Getting on the element on which event has occured
  const textBox = $(event.target);

  // Getting the value of the textarea
  const value = textBox.val().trim();

  // Checking for the availability of the submit button
  const submitButton = $("#submitPostButton");
  if (submitButton.length == 0) return alert("No sumbit button found");

  // enabling submit button on when text area has a value
  if (value == "") {
    return submitButton.prop("disabled", true);
  } else {
    return submitButton.prop("disabled", false);
  }
});

// Implementing the functionality for the post button of the post form.
$("#submitPostButton").click((event) => {
  // Getting on the element on which event has occured
  const button = $(event.target);

  // Selecting the text area of the post form
  const textBox = $("#postTextarea");

  // creating the object with the value of the post as a content porperty which will be send to the server
  const data = {
    content: textBox.val(),
  };

  // clearing the text area
  textBox.val("");

  // disabling the post button
  button.prop("disabled", true);

  // Making a post request to the '/api/posts' with the data object and a callback function which gets the first parameter as the outputted value from the server.
  $.post("/api/posts", data, (postData) => {
    // Gets the html from the createPostHtml function
    const html = createPostHtml(postData);

    // prepending the new post to the top of the posts list
    $(".postsContainer").prepend(html);
  });
});

// Functionality for like button
// We can't directly do $(".likeButton").click() because the like button is dynamically added to the page and when document sets the event handler to the likeButton class it is not present at that moment of time. So we attach the event handler to the whole document and ask it to listen to the click event on the ".likeButton" class using the ".on" method.
$(document).on("click", ".likeButton", (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);
  if (postId === undefined) return;

  // This is the way to make put request to the server for changing the status of like button
  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: "PUT",
    success: (postData) => {
      // Showing the no. of likes the post has got
      if (postData.likes.length === 0) {
        button.find("span").text("");
      } else {
        button.find("span").text(postData.likes.length);
      }

      // Setting the colour of the like button based on if the user has liked the post
      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

// Function to get the id of the post tat the user likes
function getPostIdFromElement(element) {
  const isRoot = element.hasClass("post");
  const rootElement = isRoot ? element : element.closest(".post");
  const postId = rootElement.data().id;

  if (postId == undefined) return alert("post id undefined");

  return postId;
}

// function for creating the html for the new post that will be prepended once submitted.
function createPostHtml(postData) {
  // Getting the information of the posted user
  const { postedBy } = postData;

  // Checking if the auther is included in the post info
  if (postedBy._id === undefined) {
    return alert("User object not found");
  }

  // Getting the full name of the posted user
  const displayName = `${postedBy.firstName} ${postedBy.lastName}`;

  // Setting the time at which user posts the post
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  // Setting the status of like button base on based on if the postData array contains the logged in user id.
  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";

  // returns the html
  return `<div class="post" data-id="${postData._id}">
            <div class="mainContentContainer">
              <div class="userImageContainer">
                <img src=${postedBy.profilePic}>
              </div>
              <div class="postContentContainer">
                <div class="header">
                  <a href="/profile/${
                    postedBy.username
                  }" class="displayName">${displayName}</a>
                  <span class="username">@${postedBy.username}</span>
                  <span class="date">${timestamp}</span>
                </div>
                <div class="postBody">
                  <span>${postData.content}</span>
                </div>
                <div class="postFooter">
                  <div class="postButtonContainer">
                    <button>
                      <i class="fa-regular fa-comment"></i>
                    </button>
                  </div>
                  <div class="postButtonContainer green">
                    <button class="retweet">
                      <i class="fa-solid fa-retweet"></i>
                    </button>
                  </div>
                  <div class="postButtonContainer red">
                    <button class="likeButton ${likeButtonActiveClass}">
                      <i class="fa-regular fa-heart"></i>
                      <span>${postData.likes.length || ""}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
}

// Function for converting the date into relative time
function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}
