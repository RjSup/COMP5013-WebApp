$(document).ready(function() {
    // test ready function
    console.log('Document is ready');
    checkLoggedIn(); // Check if user is logged in
    getTopics(); // Get topics from the database
   
    // Add event listener for login link
    $(document).on('click', '#loginLink', function(e) {
        e.preventDefault();
        // test login link click
        console.log('Login link clicked');
        showLoginForm();
    });

    // Add event listener for signup link
    $(document).on('click', '#signupLink', function(e) {
        e.preventDefault();
        // test signup link click
        console.log('Signup link clicked');
        showSignupForm();
    });

    // Add event listener for logout link
    $(document).on('click', '#logoutLink', function(e) {
        e.preventDefault();
        // test logout link click
        console.log('Logout link clicked');
        logout();
    });

    // Add event listener for add topic form
    $('#addTopicForm').submit(function(event) {
        event.preventDefault();
        var topicName = $('#topicName').val();
        var postingUser = $('#postingUser').val();
        // Check if user is logged in
        $.ajax({
            url: '/check-login',
            type: 'GET',
            success: function(response) {
                // test check login success
                console.log('Check login success:', response); 
                if (response.logged_in) {
                    addTopic(topicName, postingUser);
                } else {
                    // test check login failure
                    console.log('Not logged in:', response);
                    showLoginForm();
                }
            },
            error: function(xhr, status, error) {
                // check for any errors
                console.error("Error:", error);
            }
        });
    });
});

function showLoginForm() {
    $('#authForms').html(`
        <form id="loginForm">
            <input type="text" id="loginUsername" placeholder="Username" required>
            <input type="password" id="loginPassword" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    `);
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        // test login form submit
        console.log('Login form submitted');
        var username = $('#loginUsername').val();
        var password = $('#loginPassword').val();
        login(username, password);
    });
}

function showSignupForm() {
    $('#authForms').html(`
        <form id="signupForm">
            <input type="text" id="signupUsername" placeholder="Username" required>
            <input type="password" id="signupPassword" placeholder="Password" required>
            <button type="submit">Sign Up</button>
        </form>
    `);
    $('#signupForm').submit(function(e) {
        e.preventDefault();
        // test signup form submit
        console.log('Signup form submitted');
        var username = $('#signupUsername').val();
        var password = $('#signupPassword').val();
        signup(username, password);
    });
}

function login(username, password) {
    $.ajax({
        type: 'POST',
        url: '/login',
        data: {
            username: username,
            password: password
        },
        success: function(response) {
            // test login success
            console.log('Login success:', response);
            alert(response);
            window.location.href = '/';
            checkLoggedIn();
        },
        error: function(xhr, status, error) {
            // check for errors with login
            console.error("Error:", error);
            alert("Error: " + error);
        }
    });
}

function signup(username, password) {
    $.ajax({
        type: 'POST',
        url: '/signup',
        data: {
            username: username,
            password: password
        },
        success: function(response) {
            // test signup success 
            console.log('Signup success:', response);
            alert(response);
            window.location.href = '/';
            checkLoggedIn();
        },
        error: function(xhr, status, error) {
            // check for errors with signup
            console.error("Error:", error);
            alert("Error: " + error);
        }
    });
}

function checkLoggedIn() {
    $.ajax({
        type: 'GET',
        url: '/check-login',
        success: function(response) {
            // test check login success
            console.log('Check login success:', response);
            if (response.logged_in) {
                $('#authLinks').html(`<a id="logoutLink" href="#">Logout</a>`);
                if (response.is_admin) {
                    $('#addTopicForm').show();
                } else {
                    $('#addTopicForm').hide();
                }
            } else {
                $('#authLinks').html(`
                    <a id="loginLink" href="#">Login</a>
                    <a id="signupLink" href="#">Sign Up</a>
                `);
                $('#addTopicForm').hide();
            }
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

function logout() {
    $.ajax({
        type: 'POST',
        url: '/logout',
        success: function(response) {
            // test logout success
            console.log('Logout success:');
            checkLoggedIn();
        },
        error: function(xhr, status, error) {
            // check for errors with logout
            console.error("Error:", error);
            alert("Error: " + error);
        }
    });
}

function addTopic(topicName, postingUser) {
    $.ajax({
        url: '/add_topic',
        type: 'POST',
        data: {
            topicName: topicName,
            postingUser: postingUser
        },
        success: function(response) {
            // test add topic success
            console.log('Add topic success:', response);
            getTopics();
            $('#topicCards').append('<div class="topicCard">' +
                '<h3>' + topicName + '</h3>' +
                '<p>Posting User: ' + postingUser + '</p>' +
                '</div>');
            
            $('#topicId').val('');
            $('#topicName').val('');
            $('#postingUser').val('');
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

function getTopics() {
    $.ajax({
        type: 'GET',
        url: '/fetch_topics',
        success: function(response) {
            // test fetch topics success
            console.log('Fetch topics success:', response);
            renderTopics(response.topics);
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

function renderTopics(topics) {
    $('#topicCards').empty();

    topics.forEach(function(topic, index) {
        var topicCard = $('<div class="topicCard" id="topicCard' + index + '">' +
                            '<h3>'+ topic.topicName + '</h3>' +
                            '<button class="topicButton" data-topic="' + topic.topicName + '">Join</button>' +
                         '</div>');

        $('#topicCards').append(topicCard);
        
        $('#topicCards').css({
            'display': 'grid',
            'grid-template-columns': 'repeat(8, 1fr)',
            'grid-template-rows': 'repeat(3, 1fr)',
            'gap': '40px',
            'padding': '60px',
        });

        $('.topicCard').css({
            'box-shadow': '0 0 15px rgba(0, 0, 0, 0.2)',
            'padding': '20px',
            'border-radius': '5px',
        });

        $('.topicCard').hover(
            function() {
                $(this).css({
                    'transform': 'scale(1.001)',
                    'border': '2px solid',
                    'border-color': 'rgba(255, 246, 143, 1)',
                });
            },
            function() {
                $(this).css({
                    'transform': 'scale(1)',
                    'border': 'none'
                });
            }
        );
    });

    $('.topicButton').click(function() {
        var topicName = $(this).data('topic');
        window.location.href = '/topic/' + encodeURIComponent(topicName);
    });
}
