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
                alert(response);
                //window.location.href = '/';
                checkLoggedIn();
            },
            error: function(xhr, status, error) {
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
                alert(response);
                window.location.href = '/';
                checkLoggedIn();
            },
            error: function(xhr, status, error) {
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
                checkLoggedIn();
            },
            error: function(xhr, status, error) {
                alert("Error: " + error);
            }
        });
    }
});
