//* ====================
//* LANDING PAGE SCRIPTS
//* ====================


//* ====================
//* SCRIPTS TO LOAD ON PAGE LOAD
//* ====================
$(document).ready(function() {
    checkLoggedIn(); // Check if user is logged in
   
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
            } else {
                // User is not logged in, show login and signup links
                $('#authLinks').html(`
                    <a id="loginLink" href="#">Login</a>
                    <a id="signupLink" href="#">Sign Up</a>
                `);
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
