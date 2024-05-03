// This function sets up the necessary actions when the document is ready
$(document).ready(function () {
  console.log("Topic.js loaded and ready"); // Log that the script is loaded
  checkLoggedIn(); // Check if the user is logged in
  setupTopicPage(); // Set up the topic page
  setupClaimEvents(); // Set up event handlers for claims
});

// This function sets up the topic page
function setupTopicPage() {
  var topicName = decodeURIComponent(document.title.split(" | ")[1].trim()); // Decode the topic name from the document title
  $(".topicHeader h1").text(topicName); // Set the topic name in the header
  fetchClaims(topicName); // Fetch claims related to the topic
}

// This function sets up event handlers for claims
function setupClaimEvents() {
  // Event handler for adding a claim
  $(document).on("click", "#addClaimButton", function (event) {
    event.preventDefault(); // Prevent default form submission
    addClaim(); // Call the function to add a claim
  });

  // Event handler for showing claim details
  $(document).on("click", ".card", function () {
    showClaimDetails($(this).find("p:first").text().trim()); // Call the function to show claim details
  });

  // Event handler for closing the claim modal
  $(".close, .modal2").on("click", function (event) {
    if (event.target === this) {
      $("#claimModal").css("display", "none"); // Close the claim modal
    }
  });

  // Event handler for submitting a reply form
  $(document).on("submit", "#replyForm", function (event) {
    event.preventDefault(); // Prevent default form submission
    submitReplyForm(); // Call the function to submit a reply
  });
}

// Function to add a claim
function addClaim() {
  var claimText = $("#claimText").val().trim(); // Get the claim text from the input field
  var postingUser = $("#currentUserId").val(); // Get the posting user ID
  var topicName = $(".addClaimForm").data("topic"); // Get the topic name from the form data

  // Sanitize claim text to prevent XSS attacks
  claimText = sanitizeInput(claimText);

  // Validate claim text
  if (!claimText) {
    console.log("Claim text cannot be empty"); // Log an error if claim text is empty
    return;
  }

  // Check claim text length
  if (claimText.length > 500) {
    console.log("Claim text is too long"); // Log an error if claim text is too long
    return;
  }

  // AJAX request to add the claim
  $.ajax({
    url: "/add_claim",
    type: "POST",
    data: {
      topic_name: topicName,
      claimText: claimText,
      postingUser: postingUser,
    },
    success: function (response) {
      console.log("Add claim success:", response); // Log success message
      fetchClaims(topicName); // Fetch claims after adding a new one
      $("#claimText").val(""); // Clear the claim text input field
    },
    error: function (xhr, status, error) {
      console.error("Error adding claim:", xhr.responseText); // Log error message
      alert("Failed to add claim: " + xhr.responseText); // Show error message to user
    },
  });
}

// Function to show claim details
function showClaimDetails(claimText) {
  var topicName = decodeURIComponent(document.title.split(" | ")[1].trim()); // Decode the topic name from the document title
  $("#claimDetail").text(claimText); // Set the claim text in the claim detail section
  $("#claimModal").css("display", "block"); // Show the claim modal
  fetchReplies(topicName, claimText); // Fetch replies related to the claim
}

// Function to submit a reply form
function submitReplyForm() {
  var replyText = $("#replyText").val().trim(); // Get the reply text from the input field
  var replyType = $('input[name="replyType"]:checked').val(); // Get the reply type
  var topicName = decodeURIComponent($("#claimDetail").text().trim()); // Decode the topic name from the claim detail section

  // Validate reply text
  if (!replyText) {
    console.log("Reply text cannot be empty"); // Log an error if reply text is empty
    return;
  }

  // Check reply text length
  if (replyText.length > 300) {
    console.log("Reply text is too long"); // Log an error if reply text is too long
    return;
  }

  // Submit the reply
  if (replyText && replyType && topicName) {
    submitReply(replyText, replyType, topicName);
  } else {
    console.log("Error"); // Log an error if required data is missing
  }
}

// Function to fetch claims related to a topic
function fetchClaims(topicName) {
  // AJAX request to fetch claims
  $.ajax({
    type: "GET",
    url: "/fetch_claims/" + topicName,
    success: function (response) {
      console.log("Fetch claims response:", response); // Log the response
      renderClaims(response.claims); // Render fetched claims
    },
    error: function (xhr, status, error) {
      console.error("Error fetching claims:", xhr.responseText); // Log error message
      alert("Failed to fetch claims: " + xhr.responseText); // Show error message to user
    },
  });
}

function renderClaims(claims) {
  var $cardGrid = $("#card-grid").empty();

  // Calculate the number of columns and rows for the grid
  var numColumns = 6;
  var numRows = Math.ceil(claims.length / numColumns);

  // Set up grid layout
  $cardGrid.css({
    display: "grid",
    "grid-template-columns": "repeat(" + numColumns + ", 1fr)",
    "grid-template-rows": "repeat(" + numRows + ", 1fr)",
    gap: "40px",
    padding: "20px",
    height: "fit-content",
    width: "100%", // Occupy full width
    justifyContent: "center", // Center cards horizontally
  });

  claims.reverse().forEach(function (claim, index) {
    var claimElement = $(
      '<div class="card">' +
        "<div class='claim-text'>" +
        "<p>" +
        claim.claimText +
        "</p>" +
        "</div>" +
        "<div class='posting-user'>Posted by: " +
        claim.postingUser +
        "</div>" +
        "</div>",
    );

    claimElement.css({
      "background-color": "#f4f4f4",
      "border-radius": "8px",
      padding: "20px",
      "box-shadow": "0 0 15px rgba(0, 0, 0, 0.2)",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%", // Ensure each card takes up equal height
    });

    claimElement.hover(
      function () {
        $(this).css({
          transform: "scale(1.01)",
          border: "2px solid",
          "border-color": "#1a202c",
        });
      },
      function () {
        $(this).css({
          transform: "scale(1)",
          border: "none",
        });
      },
    );

    // Add spacing between claim text and posting user
    claimElement.find(".claim-text").css({
      marginBottom: "60px",
    });
    claimElement.find(".claim-text p").css({
      "font-size": "20px",
    });
    claimElement.find(".posting-user p").css({
      "font-size": "15px",
    });

    $cardGrid.append(claimElement);
  });
}

function submitReply(replyText, replyType, topicName) {
  $.ajax({
    type: "POST",
    url: "/submit_reply",
    data: {
      replyText: replyText,
      replyType: replyType,
      topicName: topicName,
    },
    success: function (response) {
      console.log("Reply submission success:", response);
      $("#claimModal").css("display", "none");
    },
    error: function (xhr, status, error) {
      console.error("Error submitting reply:", xhr.responseText);
      alert("Failed to submit reply: " + xhr.responseText); // Display an alert with the error message
    },
  });
}

function fetchReplies(topicName, claimText) {
  $.ajax({
    type: "GET",
    url: "/fetch_replies/" + topicName,
    data: {
      claimText: claimText,
    },
    success: function (response) {
      console.log("Fetch replies response:", response);
      renderReplies(response.replies);
    },
    error: function (xhr, status, error) {
      console.error("Error fetching replies:", xhr.responseText);
      alert("Failed to fetch replies: " + xhr.responseText); // Display an alert with the error message
    },
  });
}

function renderReplies(replies) {
  var $claimReplies = $("#claimReplies").empty();

  replies.reverse().forEach(function (reply) {
    var replyElement = $('<div class="reply"></div>'); // Container for entire reply

    // Main comment text
    var commentElement = $(
      '<p class="comment" style="margin-bottom: 10px;">Reply: ' +
        reply.text +
        "</p>",
    );

    // Set text color based on reply type
    if (reply.replyType === 1) {
      commentElement.css("color", "blue"); // Clarification
    } else if (reply.replyType === 2) {
      commentElement.css("color", "green"); // Supporting Argument
    } else if (reply.replyType === 3) {
      commentElement.css("color", "red"); // Counterargument
    }

    replyElement.append(commentElement);

    // Add the posting user's name
    var userNameElement = $(
      '<p class="userName" style="margin-bottom: 10px;">Posted by: ' +
        reply.postingUser +
        "</p>",
    );
    replyElement.append(userNameElement);

    // Add reply type directly based on the replyType field from the response
    var replyTypeElement;
    if (reply.replyType === 1) {
      replyTypeElement = $(
        '<p class="replyType clarification" style="margin-bottom: 10px;">Clarification</p>',
      );
    } else if (reply.replyType === 2) {
      replyTypeElement = $(
        '<p class="replyType supportingArgument" style="margin-bottom: 10px;">Supporting Argument</p>',
      );
    } else if (reply.replyType === 3) {
      replyTypeElement = $(
        '<p class="replyType counterargument" style="margin-bottom: 10px;">Counterargument</p>',
      );
    } else {
      replyTypeElement = $(
        '<p class="replyType against" style="margin-bottom: 10px;">Against</p>',
      );
    }
    replyElement.append(replyTypeElement);

    // Add "Reply to Claim" button with modern styling
    var replyButton = $(
      '<button class="btnbtn replyToClaimButton">Reply to Claim</button>',
    );
    replyElement.append(replyButton);

    // Add reply form
    var replyForm = $('<form class="replyForm" style="display: none;"></form>'); // Initially hidden
    var replyTextArea = $(
      '<textarea class="replyText" style="height: 150px; margin-bottom: 10px;" placeholder="Your reply"></textarea>',
    ); // Increase height
    var replyTypeSelect = $(
      '<select class="replyType btnbtn" style="margin-bottom: 10px;"></select>',
    ).append('<option value="1">Reply to Comment</option>');
    var submitButton = $(
      '<button class="btnbtn replyButton" type="submit">Reply</button>',
    );

    replyForm.append(
      replyTextArea,
      "<br>",
      replyTypeSelect,
      "<br>",
      submitButton,
    );
    replyElement.append(replyForm);

    // Toggle reply form visibility when "Reply to Claim" button is clicked
    replyButton.click(function () {
      replyForm.toggle(); // Toggle visibility
    });

    // Submit reply form
    replyForm.submit(function (event) {
      event.preventDefault();
      var replyText = replyTextArea.val();
      var replyType = replyTypeSelect.val();
      // Implement your logic to handle the reply submission
      // You can use replyText and replyType variables to send the data to the server
      console.log("Reply Text:", replyText);
      console.log("Reply Type:", replyType);
      // Clear reply input after submission
      replyTextArea.val("");
    });

    // Add spacing and border around each reply
    replyElement.css({
      background: "#f4f4f4",
      border: "1px solid #ccc",
      padding: "10px",
      "border-radius": "5px",
      "margin-bottom": "20px", // Add spacing between replies
      "margin-top": "20px", // Add padding to the top
    });

    // Add margin between elements inside reply form
    replyForm.children().css("margin-bottom", "10px");

    $claimReplies.append(replyElement);
  });
}
