// Common functions for login, signup, logout, and checking login status
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
            window.location.href = '/';
            checkLoggedIn();
        },
        error: function(xhr, status, error) {
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
            console.log('Signup success:', response);
            alert(response);
            window.location.href = '/';
            checkLoggedIn();
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
            alert("Error: " + error);
        }
    });
}

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

function checkLoggedIn() {
    $.ajax({
        type: 'GET',
        url: '/check-login',
        success: function(response) {
            console.log('Check login success:', response);
            if (response.logged_in) {
                $('#authLinks').html(`<a id="logoutLink" href="#">Logout</a>`);
                if (response.is_admin) {
                    $('#addTopicForm').show(); // Show add topic form for admins
                } else {
                    $('#addTopicForm').hide(); // Hide add topic form for non-admins
                }
            } else {
                $('#authLinks').html(`
                    <a id="loginLink" href="#">Login</a>
                    <a id="signupLink" href="#">Sign Up</a>
                `);
                $('#addTopicForm').hide(); // Hide add topic form for non-logged in users
            }
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

function searchTopics(searchTerm) {
    $.ajax({
        type: 'GET',
        url: '/search',
        data: {
            term: searchTerm
        },
        success: function(response) {
            console.log('Search success:', response);
            displaySearchResults(response.results);
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

function displaySearchResults(results) {
    var modalContent = '<div id="searchResultsModal" class="modal">';
    modalContent += '<div class="modal-content">';
    modalContent += '<span class="close">&times;</span>';
    modalContent += '<h2>Search Results</h2>';
    modalContent += '<div id="searchResultsList">';
    
    if (results.topics.length > 0) {
        modalContent += '<h3>Topics</h3>';
        modalContent += '<ul>';
        results.topics.forEach(function(topic) {
            modalContent += '<li><a href="/topic/' + encodeURIComponent(topic.topicName) + '">' + topic.topicName + '</a></li>';
        });
        modalContent += '</ul>';
    }

    if (results.claims.length > 0) {
        modalContent += '<h3>Claims</h3>';
        modalContent += '<ul>';
        results.claims.forEach(function(claim) {
            modalContent += '<li><a href="#">' + claim.text + '</a></li>';
        });
        modalContent += '</ul>';
    }

    modalContent += '</div>'; // Close searchResultsList
    modalContent += '</div>'; // Close modal-content
    modalContent += '</div>'; // Close modal

    // Append modal content to body
    $('body').append(modalContent);

    // Open the modal
    $('#searchResultsModal').show();

    // Attach click event handler to the items in the modal
    $('#searchResultsList a').click(function(e) {
        e.preventDefault();
        var url = $(this).attr('href');
        window.location.href = url;
    });

    // Close the modal when the close button is clicked
    $('.close').click(function() {
        $('#searchResultsModal').hide();
        $('#searchResultsModal').remove();
    });
}
