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

// function for creating the html for the new post that will be prepended once submitted.
function createPostHtml(postData) {
  // Getting the information of the posted user
  const { postedBy } = postData;

  // Getting the full name of the posted user
  const displayName = `${postedBy.firstName} ${postedBy.lastName}`;

  // Setting the time at which user posts the post
  const timestamp = "later";

  // returns the html
  return `<div class="post">
            <div class="mainContentContainer">
              <div class="userImageContainer">
                <img src=${postedBy.profilePic}>
              </div>
              <div class="postContentContainer">
                <div class="header">
                  <a href="/profile/${postedBy.username}" class="displayName">${displayName}</a>
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
                  <div class="postButtonContainer">
                    <button>
                      <i class="fa-solid fa-retweet"></i>
                    </button>
                  </div>
                  <div class="postButtonContainer">
                    <button>
                      <i class="fa-regular fa-heart"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
}
