// Document ready function to initialize landing page functionality
$(document).ready(function () {
  console.log("Landing.js loaded and ready"); // Logging script readiness
  getTopics(); // Fetch topics when the document is ready
  setupSearch(); // Initialize search functionality
});

// Function to add a new topic
function addTopic(topicName, postingUser) {
  // AJAX request to add topic
  $.ajax({
    url: "/add_topic",
    type: "POST",
    data: {
      topicName: topicName,
      postingUser: postingUser,
    },
    success: function (response) {
      // Log success and update topics
      console.log("Add topic success:", response);
      getTopics(); // Fetch updated topics from the server
      // Reset input fields
      $("#topicId").val("");
      $("#topicName").val("");
      $("#postingUser").val("");
    },
    error: function (xhr, _status, error) {
      // Log and alert on error
      console.error("Error:", error);
      alert("Failed to add topic: " + xhr.responseText);
    },
  });
}

// Function to fetch topics from the server
function getTopics() {
  // AJAX request to fetch topics
  $.ajax({
    type: "GET",
    url: "/fetch_topics",
    success: function (response) {
      // Log success and render topics
      console.log("Fetch topics success:", response);
      renderTopics(response.topics);
    },
    error: function (xhr, _status, error) {
      // Log and alert on error
      console.error("Error:", error);
      alert("Failed to get topics:" + xhr.responseText);
    },
  });
}

function renderTopics(topics) {
  // no topics found
  if (!topics || topics.length === 0) {
    console.log("No topics found in response");
    return;
  }

  // Clear topic cards
  $("#topicCards").empty();

  // Array of topic objects with image URLs
  var topicImages = [
    { topicName: "Computer Science", imageUrl: "static/img/compsci.png" },
    { topicName: "Physics", imageUrl: "static/img/physics.jpg" },
    { topicName: "Gaming", imageUrl: "static/img/gaming.jpg" },
    { topicName: "ESports", imageUrl: "static/img/esport.jpg" },
    { topicName: "Football", imageUrl: "static/img/football.jpg" },
    { topicName: "Dota 2", imageUrl: "static/img/dota.jpg" },
    { topicName: "Fishing", imageUrl: "static/img/fish.jpg" },
    { topicName: "Water", imageUrl: "static/img/water.jpg" },
    { topicName: "Ice Hockey", imageUrl: "static/img/hockey.jpg" },
    { topicName: "keyboards", imageUrl: "static/img/keyboard.jpg" },
    { topicName: "Laptops", imageUrl: "static/img/laptop.jpg" },
    { topicName: "EU", imageUrl: "static/img/eu.jpg" },
    { topicName: "Reading", imageUrl: "static/img/reading.jpg" },
    { topicName: "India", imageUrl: "static/img/india.jpg" },
    { topicName: "Smoking", imageUrl: "static/img/smoking.jpg" },
    { topicName: "Clothing", imageUrl: "static/img/clothing.jpg" },
    { topicName: "University", imageUrl: "static/img/uni.jpg" },
    {
      topicName: "Electric Vehicles", imageUrl: "static/img/electricvehicle.jpg",
    },
  ];

  // Function to find the image URL based on topic name
  function getImageUrl(topicName) {
    // Iterate through the topic images array
    for (var i = 0; i < topicImages.length; i++) {
      // Return the image URL if the topic name is found
      if (topicImages[i].topicName === topicName) {
        //
        return topicImages[i].imageUrl;
      }
    }
    // Return a default image URL if the topic name is not found
    return "static/img/default.jpg";
  }

  // Iterate through the topics and render topic cards
  topics.forEach(function (topic, index) {
    //
    var imageUrl = getImageUrl(topic.topicName);
    //
    var topicCard = $(
      //
      '<div class="topicCard" id="topicCard' +
        index +
        '">' +
        '<div class="topicImage">' +
        '<img src="' +
        imageUrl +
        '" alt="' +
        topic.topicName +
        '">' +
        "</div>" +
        '<div class="topicInfo">' +
        '<h3 class=""topicName>' +
        topic.topicName +
        "</h3>" +
        '<button class="topicButton" data-topic="' +
        topic.topicName +
        '">Join</button>' +
        "</div>" +
        "</div>",
    );
    
    // Append the topic card to the topic cards container
    $("#topicCards").append(topicCard);
  });

  // Apply CSS styles to the topic cards
  $("#topicCards").css({
    display: "grid",
    "grid-template-columns": "repeat(6, 1fr)",
    "grid-template-rows": "repeat(1, 1fr)",
    gap: "40px",
    padding: "30px",
  });

  // Apply CSS styles to the topic card elements
  $("h3").css({
    "padding-bottom": "20px",
  });

  $(".topicCard").css({
    "box-shadow": "0 0 15px rgba(0, 0, 0, 0.2)",
    padding: "15px",
    "border-radius": "5px",
    display: "flex",
  });

  $(".topicName").css({
    display: "flex",
    "justify-content": "flex-start",
  });

  $(".topicImage").css({
    flex: "1",
  });

  $(".topicImage img").css({
    width: "100%",
    height: "100%",
    transition: "transform .2s ease-in-out",
    "max-height": "100%",
    "object-fit": "cover",
  });
  $(".topicImage img").hover(
    function () {
      $(this).css({
        transform: "scale(1.07)",
        "border-radius": "5px",
      });
    },
    function () {
      $(this).css({
        transform: "scale(1)",
        border: "none",
      });
    },

    $(".topicCard").hover(
      function () {
        $(this).css({
          transform: "scale(1.05)",
          transition: "transform .2s ease-in-out",
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
    ),
  );
  
// Add click event listener to topic buttons
  $(".topicButton").click(function () {
    // Redirect to the topic page when the button is clicked
    var topicName = $(this).data("topic");
    // Redirect to the topic page with the topic name as a URL parameter
    window.location.href = "/topic/" + encodeURIComponent(topicName);
  });
  
  $(".topicButton").css({
    padding: "10px",
    border: "none",
    "border-radius": "5px",
    cursor: "pointer",
  });
}
