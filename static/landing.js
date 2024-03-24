// landing page logic

$(document).ready(function() {
    checkLoggedIn(); // Check if user is logged in
   
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
});


// Function to display login form
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

// Function to display signup form
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
            alert(response); // Handle response from server
            window.location.href = '/'; // Redirect to home page after successful login
        },
        error: function(xhr, status, error) {
            alert("Error: " + error); // Handle error
        }
    });
}

// Function to sign up
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

// Function to logout
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
