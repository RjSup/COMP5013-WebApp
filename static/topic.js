$(document).ready(function() {
    console.log('Document is ready');
    checkLoggedIn();
   
    // Fetch topic name asynchronously
    var topicName = document.title.split(' | ')[1].trim();
    $('.topicHeader h1').text(topicName);
    fetchClaims(topicName);
   
    // Event listener for login link
    $(document).on('click', '#loginLink', function(e) {
        e.preventDefault();
        console.log('Login link clicked');
        showLoginForm();
    });

    // Event listener for signup link
    $(document).on('click', '#signupLink', function(e) {
        e.preventDefault();
        console.log('Signup link clicked');
        showSignupForm();
    });

    // Event listener for logout link
    $(document).on('click', '#logoutLink', function(e) {
        e.preventDefault();
        console.log('Logout link clicked');
        logout();
    });
});

// Function to show login form
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
        console.log('Login form submitted');
        var username = $('#loginUsername').val();
        var password = $('#loginPassword').val();
        login(username, password);
    });
}

// Function to show signup form
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
        console.log('Signup form submitted');
        var username = $('#signupUsername').val();
        var password = $('#signupPassword').val();
        signup(username, password);
    });
}

// Function to login
function login(username, password) {
    $.ajax({
        type: 'POST',
        url: '/login',
        data: {
            username: username,
            password: password
        },
        success: function(response) {
            console.log('Login success:', response);
            alert(response);
            checkLoggedIn();
            // Close login form
            $('#authForms').empty();
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
            alert("Error: " + error);
        }
    });
}

// Function to logout
function logout() {
    $.ajax({
        type: 'POST',
        url: '/logout',
        success: function(response) {
            console.log('Logout success:');
            checkLoggedIn();
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
            alert("Error: " + error);
        }
    });
}

// Function to signup
function signup(username, password) {
    $.ajax({
        type: 'POST',
        url: '/signup',
        data: {
            username: username,
            password: password
        },
        success: function(response) {
            console.log('Signup success:', response);
            alert(response);
            window.location.href = '/';
            checkLoggedIn();
            // Close signup form
            $('#authForms').empty();
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
            alert("Error: " + error);
        }
    });
}

// Function to check if user is logged in
function checkLoggedIn() {
    $.ajax({
        type: 'GET',
        url: '/check-login',
        success: function(response) {
            console.log('Check login success:', response);
            if (response.logged_in) {
                $('#authLinks').html(`<a id="logoutLink" href="#">Logout</a>`);
                $('.addClaimForm p').hide(); // Hide the "Log in to add claim" message
                $('.addClaimForm textarea').show(); // Show the add claim form
                $('.addClaimForm button').show(); // Show the add claim button
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
                $('.addClaimForm p').show(); // Show the "Log in to add claim" message
                $('.addClaimForm textarea').hide(); // Hide the add claim form
                $('.addClaimForm button').hide(); // Hide the add claim button
                $('#addTopicForm').hide();
            }
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

// Add an event listener for claim submission
$(document).on('click', '#addClaimButton', function(event) {
    event.preventDefault();
    var claimText = $('#claimText').val().trim();
    var postingUser = $('#currentUserId').val();
    var topicName = $('.addClaimForm').data('topic'); // Get the topic name from the form's data

    $.ajax({
        url: '/add_claim',
        type: 'POST',
        data: {
            topic_name: topicName,
            claimText: claimText,
            postingUser: postingUser
        },
        success: function(response) {
            console.log('Add claim success:', response);
            fetchClaims(topicName); // Fetch and render updated claims
            $('#claimText').val(''); // Clear the claim text input field
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
});


// Fetch claims for the topic asynchronously
function fetchClaims(topicName) {
    $.ajax({
        type: 'GET',
        url: '/fetch_claims/' + topicName,
        success: function(response) {
            console.log('Fetch claims response:', response);
            renderClaims(response.claims);
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

// Render claims asynchronously
function renderClaims(claims) {
    $('#card-grid').empty();

    claims.forEach(function(claim, index) {
        var claimElement = $('<div class="card">' +
            '<p>' + claim.claimText + '<p>' +
            '<p>Posting User: ' + claim.postingUser + '</p>' +
            '</div>');

        $('#card-grid').append(claimElement);

        $('#card-grid').css({
            'display': 'grid',
            'grid-template-columns': 'repeat(3, 1fr)',
            'grid-template-rows': 'repeat(3, 1fr)',
            'gap': '40px',
            'padding': '20px',
        });

        claimElement.css({
            'background-color': 'white',
            'border-radius': '8px',
            'padding': '20px',
            'box-shadow': '0 0 10px rgba(0, 0, 0, 0.1)',
        });

        claimElement.hover(
            function() {
                $(this).css({
                    'transform': 'scale(1.001)',
                    'border': '2px solid',
                    'border-color': 'rgba(255, 246, 143, 1)'
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
}
