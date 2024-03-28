//* ====================
//* LANDING PAGE SCRIPTS
//* ====================


//* ====================
//* SCRIPTS TO LOAD ON PAGE LOAD
//* ====================
$(document).ready(function() {
    checkLoggedIn(); // Check if user is logged in
    getTopics(); // Get topics from the database
   
    // Add event listener for login link
    $(document).on('click', '#loginLink', function(e) {
        // Prevent default action
        e.preventDefault();
        // Show login form
        showLoginForm();
    });

    // Add event listener for signup link
    $(document).on('click', '#signupLink', function(e) {
        e.preventDefault();
        showSignupForm();
    });

    // Add event listener for logout link
    $(document).on('click', '#logoutLink', function(e) {
        e.preventDefault();
        logout();
    });

    // Add event listener for add topic form
    $('#addTopicForm').submit(function(event) {
        event.preventDefault(); // Prevent default form submission
        
        // Get input values
        var topicName = $('#topicName').val();
        var postingUser = $('#postingUser').val();

        // Check if user is logged in
        $.ajax({
            url: '/check-login',
            type: 'GET',
            success: function(response) {
                if (response.logged_in) {
                    // User is logged in, proceed with adding topic
                    addTopic(topicName, postingUser);
                } else {
                    // User is not logged in, show login form
                    showLoginForm();
                }
            },
            error: function(xhr, status, error) {
                console.error("Error:", error);
            }
        });
    });
});

//* ====================
//* DISPLAY AUTH FORMS
//* ====================
function showLoginForm() {
    // Display login form
    $('#authForms').html(`
        <form id="loginForm">
            <input type="text" id="loginUsername" placeholder="Username" required>
            <input type="password" id="loginPassword" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    `);
    // Add event listener for login form
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        // Get username and password
        var username = $('#loginUsername').val();
        var password = $('#loginPassword').val();
        // Call login function
        login(username, password);
    });
}

//* ====================
//* SHOW SIGNUP FORM
//* ====================
function showSignupForm() {
    $('#authForms').html(`
        <form id="signupForm">
            <input type="text" id="signupUsername" placeholder="Username" required>
            <input type="password" id="signupPassword" placeholder="Password" required>
            <button type="submit">Sign Up</button>
        </form>
    `);
    // Add event listener for signup form
    $('#signupForm').submit(function(e) {
        e.preventDefault();
        var username = $('#signupUsername').val();
        var password = $('#signupPassword').val();
        signup(username, password);
    });
}

//* ====================
//* LOGIN
//* ====================
function login(username, password) {
    // Send login request to server
    $.ajax({
        // Set request type
        type: 'POST',
        // Set request URL
        url: '/login',
        // Set request data
        data: {
            username: username,
            password: password
        },
        // Handle successful response
        success: function(response) {
            alert(response); // Handle response from server
            window.location.href = '/'; // Redirect to home page after successful login
        },
        // Handle error response
        error: function(xhr, status, error) {
            alert("Error: " + error); // Handle error
        }
    });
}

//* ====================
//* SIGNUP
//* ====================
function signup(username, password) {
    $.ajax({
        type: 'POST',
        url: '/signup',
        data: {
            username: username,
            password: password
        },
        success: function(response) {
            alert(response); // Handle response from server
            window.location.href = '/';
            checkLoggedIn(); // Redirect to home page after successful signup
        },
        error: function(xhr, status, error) {
            alert("Error: " + error); // Handle error
        }
    });
}

//* ====================
//* CHECK IS LOGGED IN
//* ====================
// Function to check login status
function checkLoggedIn() {
    $.ajax({
        type: 'GET',
        url: '/check-login',
        success: function(response) {
            if (response.logged_in) {
                // User is logged in, show logout link
                $('#authLinks').html(`<a id="logoutLink" href="#">Logout</a>`);
                // Check if user is admin
                $.ajax({
                    type: 'GET',
                    url: '/check-admin',
                    success: function(response) {
                        if (response.is_admin) {
                            // User is admin, show add topic form
                            $('#addTopicForm').show();
                        } else {
                            // User is not admin, hide add topic form
                            $('#addTopicForm').hide();
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error("Error:", error);
                    }
                });
            } else {
                // User is not logged in, show login and signup links
                $('#authLinks').html(`
                    <a id="loginLink" href="#">Login</a>
                    <a id="signupLink" href="#">Sign Up</a>
                `);
                $('#addTopicForm').hide(); // Hide add topic form for non-logged-in users
            }
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

//* ====================
//* LOGOUT
//* ====================
function logout() {
    $.ajax({
        type: 'POST',
        url: '/logout',
        success: function(response) {
            //alert(response); // Handle response from server
            checkLoggedIn(); // Check login status after logout
        },
        error: function(xhr, status, error) {
            alert("Error: " + error); // Handle error
        }
    });
}

//* ====================
//* Add topic form
//* ====================

// Function to add topic
function addTopic(topicName, postingUser) {
    // AJAX request to add topic to the database
    $.ajax({
        url: '/add_topic',
        type: 'POST',
        data: {
            topicName: topicName,
            postingUser: postingUser
        },
        success: function(response) {
            getTopics(); // Get topics from the database    
            // If the topic is successfully added to the database, update the UI
            $('#topicCards').append('<div class="topicCard">' +
                '<h3>' + topicName + '</h3>' +
                '<p>Posting User: ' + postingUser + '</p>' +
                '</div>');
            
            // Clear input fields
            $('#topicId').val('');
            $('#topicName').val('');
            $('#postingUser').val('');
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

//* ====================
//* Get topics
//* ====================
function getTopics() {
    $.ajax({
        type: 'GET',
        url: '/fetch_topics',
        success: function(response) {
            renderTopics(response.topics);
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

//* ====================
//* Render topics
//* ====================
function renderTopics(topics) {
    $('#topicCards').empty(); // Clear previous topics

    topics.forEach(function(topic) {
        // Create a topic card element
        var topicCard = $('<div class="topicCard">' +
                            '<h3>'+ topic.topicName + '</h3>' +
                            '<button>'+ "Go" +'</button>' +
                         '</div>');

         // Append the topic card to the topicCards container
     $('#topicCards').append(topicCard);
        
    // Apply CSS to style the grid layout
    $('#topicCards').css({
        'display': 'grid',
        'grid-template-columns': 'repeat(8, 1fr)', // 4 columns
        'grid-template-rows': 'repeat(3, 1fr)',    // 3 rows
        'gap': '20px',                              // Gap between cards
        'padding': '60px',
    });

    $('.topicCard').css({
        'box-shadow': '0 0 10px rgba(0, 0, 0, 0.2)', // Border shadow
        'padding': '20px' // Padding around the grid
    });
    });
}
