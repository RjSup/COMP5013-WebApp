$(document).ready(function() {
    checkLoggedIn(); // Check if user is logged in
    getTopics(); // Get topics from the database
   
    // Add event listener for login link
    $(document).on('click', '#loginLink', function(e) {
        e.preventDefault();
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
        event.preventDefault();
        var topicName = $('#topicName').val();
        var postingUser = $('#postingUser').val();
        // Check if user is logged in
        $.ajax({
            url: '/check-login',
            type: 'GET',
            success: function(response) {
                if (response.logged_in) {
                    addTopic(topicName, postingUser);
                } else {
                    showLoginForm();
                }
            },
            error: function(xhr, status, error) {
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
            alert(response);
            window.location.href = '/';
            checkLoggedIn();
        },
        error: function(xhr, status, error) {
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
            alert(response);
            window.location.href = '/';
            checkLoggedIn();
        },
        error: function(xhr, status, error) {
            alert("Error: " + error);
        }
    });
}

function checkLoggedIn() {
    $.ajax({
        type: 'GET',
        url: '/check-login',
        success: function(response) {
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
            checkLoggedIn();
        },
        error: function(xhr, status, error) {
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
                            '<p>' + topic.postingUser + '</p>' +
                            '<button class="topicButton" data-topic="' + topic.topicName + '">Join</button>' +
                         '</div>');

        $('#topicCards').append(topicCard);
        
        $('#topicCards').css({
            'display': 'grid',
            'grid-template-columns': 'repeat(8, 1fr)',
            'grid-template-rows': 'repeat(3, 1fr)',
            'gap': '20px',
            'padding': '60px',
        });

        $('.topicCard').css({
            'box-shadow': '0 0 10px rgba(0, 0, 0, 0.2)',
            'padding': '20px',
            'border-radius': '5px',
        });

        $('.topicCard').hover(
            function() {
                $(this).css('transform', 'scale(1.1)');
            },
            function() {
                $(this).css('transform', 'scale(1)');
            }
        );
    });

    $('.topicButton').click(function() {
        var topicName = $(this).data('topic');
        window.location.href = '/topic/' + encodeURIComponent(topicName);
    });
}
