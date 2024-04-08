$(document).ready(function() {
    // test ready function
    console.log('Document is ready');
    checkLoggedIn(); // Check if user is logged in
    // Get the topic name from the HTML content
    var topicName = document.title.split(' | ')[1].trim();
    // Set the topic name in the header
    $('.topicHeader h1').text(topicName);
    // Fetch claims for the topic
    fetchClaims(topicName);
   
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
            // test login form submission
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
            // test signup form submission
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
                // test login success
                console.log('Login success:', response);
                alert(response);
                //window.location.href = '/';
                checkLoggedIn();
            },
            error: function(xhr, status, error) {
                // check for any errors
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
                // test signup success
                console.log('Signup success:', response);
                alert(response);
                window.location.href = '/';
                checkLoggedIn();
            },
            error: function(xhr, status, error) {
                // check for any errors
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

    // Function to logout
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
                // check for any errors
                console.error("Error:", error);
                alert("Error: " + error);
            }
        });
    }
});

$(document).on('submit', '#addClaimForm', function(event) {
    event.preventDefault();
    var claimText = $('#claimText').val().trim(); // Trim leading and trailing whitespace
    var postingUser = $('#currentUserId').val(); // Get the ID of the current user
    var topicName = $('.addClaimForm').data('topic'); // Retrieve topic name from data attribute

    // Check if user is logged in
    $.ajax({
        url: '/check-login',
        type: 'GET',
        success: function(response) {
            // Check if the user is logged in
            console.log('Check login:', response);
            if (response.logged_in) {
                // Perform additional checks on the claim text before sending it to the server, if necessary
                
                // Call the addClaim function
                addClaim(topicName, claimText, postingUser);
            } else {
                showLoginForm();
            }
        },
        error: function(xhr, status, error) {
            // Handle errors with the check-login request
            console.error("Error:", error);
        }
    });
});

function fetchClaims(topicName) {
    $.ajax({
        type: 'GET',
        url: '/fetch_claims/' + topicName, // Update the URL to include the topic name
        success: function(response) {
            // xheck the response from the server
            console.log('Fetch claims response:', response);
            renderClaims(response.claims);
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

function renderClaims(claims) {
    $('#card-grid').empty(); // Clear the card grid container

    // Iterate over the claims and create a card for each claim
    claims.forEach(function(claim, index) {
        // Create a new card element
        var claimElement = $('<div class="card">' +
            '<p>' + claim.claimText + '<p>' +
            '<p>Posting User: ' + claim.postingUser + '</p>' +
            '</div>');

        // Append the card to the card grid container
        $('#card-grid').append(claimElement);

        // Add styling to create a grid layout
        $('#card-grid').css({
            'display': 'grid',
            'grid-template-columns': 'repeat(3, 1fr)',
            'grid-template-rows': 'repeat(3, 1fr)',
            'gap': '40px',
            'padding': '20px',
        });

        // Add additional styling to each card
        claimElement.css({
            'background-color': 'white',
            'border-radius': '8px',
            'padding': '20px',
            'box-shadow': '0 0 10px rgba(0, 0, 0, 0.1)',
        });

        claimElement.hover(
            function() {
                $(this).css({
                    'transform': 'scale(1.01)',
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



function addClaim(topicName, claimText, postingUser) {
    $.ajax({
        url: '/add_claim',
        type: 'POST',
        data: {
            topic_name: topicName, // Correct parameter name
            claimText: claimText,
            postingUser: postingUser
        },
        success: function(response) {
            // test add claim success
            console.log('Add claim success:', response);
            fetchClaims(topicName);
            $('#claimText').val('');
        },
        error: function(xhr, status, error) {
            // check for any errors
            console.error("Error:", error);
        }
    });
}

