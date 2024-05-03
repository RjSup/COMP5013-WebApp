// Load this script on every page of the website
$(document).ready(function () {
  // Set the year in the footer
  document.querySelector(".year").textContent = new Date().getFullYear();
  console.log("Common.js loaded and ready");
  // Initialize common functionality
  setupAuthLinks();
  setupAddTopicForm();
  setupSearch();
  checkLoggedIn();
});

function setupAuthLinks() {
  // Attach click event handlers to the login, signup, and logout links
  $(document).on("click", "#loginLink", function (e) {
    // Prevent the default link behavior
    e.preventDefault();
    console.log("Login link clicked");
    showLoginForm();
  });

  $(document).on("click", "#signupLink", function (e) {
    e.preventDefault();
    console.log("Signup link clicked");
    showSignupForm();
  });

  $(document).on("click", "#logoutLink", function (e) {
    e.preventDefault();
    console.log("Logout link clicked");
    logout();
  });
}

// Function to add a new topic
function setupAddTopicForm() {
  $("#addTopicForm").submit(function (event) {
    // Prevent the default form submission
    event.preventDefault();
    // Get the topic name from the input field
    var topicName = $("#topicName").val();
    $.ajax({
      // AJAX request to check if the user is logged in and is an admin
      url: "/check-login",
      type: "GET",
      // Check if the user is logged in and is an admin
      success: function (response) {
        console.log("Check login success:", response);
        // If the user is logged in and is an admin, add the topic
        if (response.logged_in && response.is_admin) {
          addTopic(topicName);
        } else {
          console.log("Not logged in or not admin:", response);
          showLoginForm();
        }
      },
      // Log and alert on error
      error: function (xhr, status, error) {
        console.error("Error:", error);
        alert("Error: " + error); // Display error message
      },
    });
  });
}

// Function to add a new topic
function setupSearch() {
  $("#searchBtn").on("click", function () {
    // Get the search term from the input field
    var searchTerm = $("#searchInput").val();
    if (searchTerm.trim() !== "") {
      // Check if the search term is not empty or whitespace
      // Perform the search using AJAX
      $.ajax({
        type: "GET",
        url: "/search",
        data: {
          term: searchTerm,
        },
        success: function (response) {
          console.log("Search success:", response);
          // Display search results
          displaySearchResults(response.results);
          // Clear the search input field
          $("#searchInput").val("");
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
          alert("Search failed: " + error); // Display error message
        },
      });
    } else {
      alert("Please enter a search term.");
    }
  });
}

function showLoginForm() {
  // Create a modal container div for showing the login form
  var modalHtml = `
        <div id="loginModal" class="modal2 common-model" role="dialog" aria-labelledby="loginModalTitle" aria-describedby="loginModalDescription">
            <div class="modal-content2">
                <button class="close" aria-label="Close Login Modal">&times;</button>
                <h2 id="loginModalTitle">Login</h2>
                <form id="loginForm" aria-label="Login Form" autocomplete="off">
                    <div class="form-group">
                        <label for="loginUsername">Username</label>
                        <input type="text" id="loginUsername" class="form-control" placeholder="Enter your username" required aria-required="true" aria-describedby="usernameError">
                        <div id="usernameError" class="error" role="alert" aria-live="assertive" aria-hidden="true"></div>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" class="form-control" placeholder="Enter your password" required aria-required="true" aria-describedby="passwordError">
                        <div id="passwordError" class="error" role="alert" aria-live="assertive" aria-hidden="true"></div>
                    </div>
                    <button type="submit" class="btn">Login</button>
                </form>
            </div>
        </div>
    `;

  // Append modal HTML to the body
  $("body").append(modalHtml);

  // Show modal
  $("#loginModal").fadeIn();

  $("#loginModal").css({
    width: "100%",
    height: "100%",
    position: "fixed", // Fixed positioning
    top: "0",
    left: "0",
    "background-color": "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
    "z-index": "1000", // Higher z-index to ensure it's on top
  });

  // Close the modal when the close button or outside the modal is clicked
  $(document).on("click", ".close, .common-modal", function (e) {
    if (e.target === this) {
      $("#loginModal").fadeOut(function () {
        $(this).remove();
      });
    }
  });

  // Prevent default form submission
  $("#loginForm").submit(function (e) {
    e.preventDefault();
    console.log("Login form submitted");
    var username = $("#loginUsername").val();
    var password = $("#loginPassword").val();
    login(username, password);
  });
}

function showSignupForm() {
  // Create a modal container div for showing the signup form
  var modalHtml = `
        <div id="signupModal" class="modal2 common-model" role="dialog" aria-labelledby="signupModalTitle" aria-describedby="signupModalDescription">
            <div class="modal-content2">
                <button class="close" aria-label="Close Signup Modal">&times;</button>
                <h2 id="signupModalTitle">Sign Up</h2>
                <form id="signupForm" aria-label="Signup Form" autocomplete="off">
                    <div class="form-group">
                        <label for="signupUsername">Username</label>
                        <input type="text" id="signupUsername" class="form-control" placeholder="Enter your username" required aria-required="true" aria-describedby="usernameError">
                        <div id="usernameError" class="error" role="alert" aria-live="assertive" aria-hidden="true"></div>
                    </div>
                    <div class="form-group">
                        <label for="signupPassword">Password</label>
                        <input type="password" id="signupPassword" class="form-control" placeholder="Enter your password" required aria-required="true" aria-describedby="passwordError">
                        <div id="passwordError" class="error" role="alert" aria-live="assertive" aria-hidden="true"></div>
                    </div>
                    <button type="submit" class="btn">Sign Up</button>
                </form>
            </div>
        </div>
    `;

  // Append modal HTML to the body
  $("body").append(modalHtml);

  // Show modal
  $("#signupModal").fadeIn();

  $("#loginModal").css({
    width: "100%",
    height: "100%",
    top: "0",
    left: "0",
    "background-color": "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
    "z-index": "1000", // Higher z-index to ensure it's on top
  });

  // Close the modal when the close button or outside the modal is clicked
  $(document).on("click", ".close, .common-modal", function (e) {
    // Close the modal if the user clicks outside the modal
    if (e.target === this) {
      // Close the modal
      $("#signupModal").fadeOut(function () {
        $(this).remove();
      });
    }
  });

  // Prevent default form submission
  $("#signupForm").submit(function (e) {
    e.preventDefault();
    console.log("Signup form submitted");
    // Get the username and password from the form
    var username = $("#signupUsername").val();
    // Get the password from the form
    var password = $("#signupPassword").val();
    signup(username, password);
  });
}

// Function to login the user
function login(username, password) {

  currPage = window.location.href;

  $.ajax({
    // AJAX request to login the user
    type: "POST",
    url: "/login",
    data: {
      username: username,
      password: password,
    },
    // Log success and alert on error
    success: function (response) {
      console.log("Login success:", response);
      alert(response); // Display success message
      // Redirect to the current page
      window.location = currPage;
      checkLoggedIn();
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
      // Get the error message from the response JSON
      var errorMessage = xhr.responseJSON
        ? xhr.responseJSON.error
        : "An error occurred while logging in.";
      alert("Login failed: " + errorMessage); // Display error message
    },
  });
}

// Function to sign up the user
function signup(username, password) {

  currPage = window.location.href;

  $.ajax({
    type: "POST",
    url: "/signup",
    data: {
      username: username,
      password: password,
    },
    success: function (response) {
      console.log("Signup success:", response);
      alert(response); // Display success message
      window.location = currPage;
      checkLoggedIn();
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
      // Get the error message from the response JSON
      var errorMessage = xhr.responseJSON
        ? xhr.responseJSON.error
        : "An error occurred while signing up.";
      alert("Signup failed: " + errorMessage); // Display error message
    },
  });
}

// Function to logout the user
function logout() {
  $.ajax({
    type: "POST",
    url: "/logout",
    success: function (response) {
      console.log("Logout success:");
      checkLoggedIn();
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
      // Get the error message from the response JSON
      var errorMessage = xhr.responseJSON
        ? xhr.responseJSON.error
        : "An error occurred while logging out.";
      alert("Logout failed: " + errorMessage); // Display error message
    },
  });
}

// Function to checklogged in user
function checkLoggedIn() {
  $.ajax({
    type: "GET",
    url: "/check-login",
    success: function (response) {
      // Log success and update topics
      console.log("Check login success:", response);
      // Update the auth links based on the response
      if (response.logged_in) {
        // If the user is logged in, show the logout link
        $("#authLinks").html(`<a id="logoutLink" href="#">Logout</a>`);
        $("#addTopicForm").show(); // Show add topic form for logged-in users
      } else {
        // If the user is not logged in, show the login and signup links
        $("#authLinks").html(`
          <a id="loginLink" href="#">Login</a>
          <a id="signupLink" href="#">Sign Up</a>
        `);
        $("#addTopicForm").hide(); // Hide add topic form for non-logged in users
      }
    },
  });
}

// Function to searxh topics
function searchTopics(searchTerm) {
  $.ajax({
    type: "GET",
    url: "/search",
    data: {
      term: searchTerm,
    },
    success: function (response) {
      console.log("Search success:", response);
      // Display search results
      displaySearchResults(response.results);
    },
    // Log and alert on error
    error: function (xhr, status, error) {
      console.error("Error:", error);
      alert("Search failed: " + error); // Display error message
    },
  });
}

// Function to display search results
function displaySearchResults(results) {
  // Create a modal container div for showing the search results
  var modalContent = '<div id="searchResultsModal" class="modal">';
  modalContent += '<div class="modal-content">';
  modalContent += '<span class="close">&times;</span>';
  modalContent += "<h2>Search Results</h2>";
  modalContent += '<div id="searchResultsList">';

  // Display the number of results
  if (results.topics.length > 0) {
    modalContent += "<h3>Topics</h3>";
    modalContent += "<ul>";
    results.topics.forEach(function (topic) {
      modalContent +=
        '<li><a href="/topic/' +
        encodeURIComponent(topic.topicName) +
        '">' +
        topic.topicName +
        "</a></li>";
    });
    // Close the topics list
    modalContent += "</ul>";
  }

  modalContent += "</div>"; // Close searchResultsList
  modalContent += "</div>"; // Close modal-content
  modalContent += "</div>"; // Close modal

  // Append modal content to body
  $("body").append(modalContent);

  // Open the modal
  $("#searchResultsModal").show();

  // Attach click event handler to the items in the modal
  $("#searchResultsList a").click(function (e) {
    e.preventDefault();
    var url = $(this).attr("href");
    window.location.href = url;
  });

  // Close the modal when the close button is clicked
  $(".close").click(function () {
    $("#searchResultsModal").hide();
    $("#searchResultsModal").remove();
  });
}

// Function to sanatize inputs
function sanitizeInput(input) {
  // Replace special characters with HTML ones
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
