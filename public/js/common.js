// Enabling sumbit button only when uses has input some value in to the text area for either post form or reply form
$("#postTextarea, #replyTextarea").keyup((event) => {
  // Getting on the element on which event has occured
  const textBox = $(event.target);

  // Getting the value of the textarea
  const value = textBox.val().trim();

  // checking if the textarea is for reply form or the post form
  const isModal = textBox.parents(".modal").length == 1;

  // Checking for the availability of the submit button
  const submitButton = isModal
    ? $("#submitReplyButton")
    : $("#submitPostButton");
  if (submitButton.length == 0) return alert("No sumbit button found");

  // enabling submit button on when text area has a value
  if (value == "") {
    return submitButton.prop("disabled", true);
  } else {
    return submitButton.prop("disabled", false);
  }
});

// Implementing the functionality for the post button of the post form and also the reply form.
$("#submitPostButton, #submitReplyButton").click((event) => {
  // Getting on the element on which event has occured
  const button = $(event.target);

  const isModal = button.parents(".modal").length == 1;

  // Selecting the text area of the post form
  const textBox = isModal ? $("#replyTextarea") : $("#postTextarea");

  // creating the object with the value of the post as a content porperty which will be send to the server
  const data = {
    content: textBox.val(),
  };

  if (isModal) {
    const id = button.data().id;
    if (id === null) return alert("button id is null");
    data.replyTo = id;
  }

  // clearing the text area
  textBox.val("");

  // disabling the post button
  button.prop("disabled", true);

  // Making a post request to the '/api/posts' with the data object and a callback function which gets the first parameter as the outputted value from the server.
  $.post("/api/posts", data, (postData) => {
    if (postData.replyTo) {
      location.reload();
    } else {
      // Gets the html from the createPostHtml function
      const html = createPostHtml(postData);

      // prepending the new post to the top of the posts list
      $(".postsContainer").prepend(html);
    }
  });
});

// ajax request to load the post on which is user want to reply to. The show.bs.modal is the inbuild bootstrap method which fires the callback function when the modal is opened.
$("#replyModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#submitReplyButton").data("id", postId);

  $.get(`/api/posts/${postId}`, (results) => {
    // Uses the outputPosts function to create html for the incoming data from the server
    outputPosts(results.postData, $("#originalPostContainer"));
  });
});

// Remove the content of the popup when the popup closes. The hidden.bs.modal is the inbuild bootstrap method which fires the callback function when teh modal closes down.
$("#replyModal").on("hidden.bs.modal", () =>
  $("#originalPostContainer").html("")
);

$("#deletePostModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#deletePostButton").data("id", postId);
});

$("#deletePostButton").click((event) => {
  const postId = $(event.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "DELETE",
  });
  location.reload();
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

// Functionality for retweeting
$(document).on("click", ".retweetButton", (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);
  if (postId === undefined) return;

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: "POST",
    success: (postData) => {
      // Showing the no. of retweets the post has got
      if (postData.retweetUsers.length === 0) {
        button.find("span").text("");
      } else {
        button.find("span").text(postData.retweetUsers.length);
      }

      // Setting the colour of the like button based on if the user has liked the post
      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".post", (event) => {
  const element = $(event.target);
  const postId = getPostIdFromElement(element);

  if (postId !== undefined && !element.is("button ")) {
    window.location.href = "/post/" + postId;
  }
});

$(document).on("click", ".followButton", (event) => {
  const button = $(event.target);
  const userId = button.data().user;

  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: "PUT",
    success: (data, status, xhr) => {
      if (xhr.status == 404) alert("User not found");

      var difference = 1;
      if (data.following && data.following.includes(userId)) {
        button.addClass("following");
        button.text("Following");
      } else {
        button.removeClass("following");
        button.text("Follow");
        difference = -1;
      }

      const followersLabel = $("#followersValue");
      if (followersLabel.length != 0) {
        const followersText = followersLabel.text();
        followersLabel.text(Number(followersText) + difference);
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
function createPostHtml(postData, largeFont = false) {
  if (postData === null) return alert("Post object is null");

  // Check is the post is retweet or not
  const isRetweet = postData.retweetData !== undefined;

  const retweetedBy = isRetweet ? postData.postedBy.username : null;

  postData = isRetweet ? postData.retweetData : postData;

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

  // Setting the status of like button based on if the postData array contains the logged in user id.
  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";

  // Setting the status of retweet button based on if the postData array contains the logged in user id.
  const retweetButtonActiveClass = postData.retweetUsers.includes(
    userLoggedIn._id
  )
    ? "active"
    : "";

  const largeFontClass = largeFont ? "largeFont" : "";

  let retweetText = "";
  if (isRetweet) {
    retweetText = `<span><i class="fa-solid fa-retweet"></i> Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a></span>`;
  }

  let replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) return alert("Reply to is not populated");

    const replyToUsername = postData.replyTo.postedBy.username;
    replyFlag = `<div class="replyFlag">Replying to <a href="/profile/${replyToUsername}">@${replyToUsername}</a></div>`;
  }

  let buttons = "";
  if (postData.postedBy._id == userLoggedIn._id) {
    buttons = `<button data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="#deletePostModal"><i class="fa-solid fa-times"></i></button>`;
  }
  // returns the html
  return `<div class="post ${largeFontClass}" data-id="${postData._id}">
            <div class="postActionContainer">${retweetText}</div>
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
                  ${buttons}
                </div>
                ${replyFlag}
                <div class="postBody">
                  <span>${postData.content}</span>
                </div>
                <div class="postFooter">
                  <div class="postButtonContainer">
                    <button data-bs-toggle="modal" data-bs-target="#replyModal">
                      <i class="fa-regular fa-comment"></i>
                    </button>
                  </div>
                  <div class="postButtonContainer green">
                    <button class="retweetButton ${retweetButtonActiveClass}">
                      <i class="fa-solid fa-retweet"></i>
                      <span>${postData.retweetUsers.length || ""}</span>
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

// function which reacts html for the each element of the incoming array
function outputPosts(results, container) {
  // Clears every thing in the container
  container.html("");

  if (!Array.isArray(results)) results = [results];

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

function outputPostsWithReplies(results, container) {
  // Clears every thing in the container
  container.html("");

  if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
    const html = createPostHtml(results.replyTo);
    container.append(html);
  }

  const mainPostHtml = createPostHtml(results.postData, true);
  container.append(mainPostHtml);

  // uses the createPostHtml function to generate html for each post in the database
  results.replies.forEach((result) => {
    const html = createPostHtml(result);
    container.append(html);
  });
}
