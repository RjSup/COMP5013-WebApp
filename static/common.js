$(document).ready(function() {
    console.log('Common');
    setupAuthLinks();
    setupAddTopicForm();
    setupSearch();
    checkLoggedIn();
});

function setupAuthLinks() {
    $(document).on('click', '#loginLink', function(e) {
        e.preventDefault();
        console.log('Login link clicked');
        showLoginForm();
    });

    $(document).on('click', '#signupLink', function(e) {
        e.preventDefault();
        console.log('Signup link clicked');
        showSignupForm();
    });

    $(document).on('click', '#logoutLink', function(e) {
        e.preventDefault();
        console.log('Logout link clicked');
        logout();
    });
}

function setupAddTopicForm() {
    $('#addTopicForm').submit(function(event) {
        event.preventDefault();
        var topicName = $('#topicName').val();
        $.ajax({
            url: '/check-login',
            type: 'GET',
            success: function(response) {
                console.log('Check login success:', response);
                if (response.logged_in && response.is_admin) {
                    addTopic(topicName);
                } else {
                    console.log('Not logged in or not admin:', response);
                    showLoginForm();
                }
            },
            error: function(xhr, status, error) {
                console.error("Error:", error);
                alert("Error: " + error); // Display error message
            }
        });
    });
}

function setupSearch() {
    $('#searchBtn').click(function() {
        getTopics();
        var searchTerm = $('#searchInput').val();
        if (searchTerm.trim() !== '') { // Check if the search term is not empty or whitespace
            // Perform the search using AJAX
            $.ajax({
                type: 'GET',
                url: '/search',
                data: {
                    term: searchTerm
                },
                success: function(response) {
                    console.log('Search success:', response);
                    // Display search results
                    displaySearchResults(response.results);
                    // Clear the search input field
                    $('#searchInput').val('');
                },
                error: function(xhr, status, error) {
                    console.error("Error:", error);
                    alert("Search failed: " + error); // Display error message
                }
            });
        } else {
            alert("Please enter a search term.");
        }
    });
}

function showLoginForm() {
    // Create a modal container div
    var modalHtml = `
        <div id="loginModal" class="modal2 common-model">
            <div class="modal-content2">
                <span class="close">&times;</span>
                <h2>Login</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginUsername">Username</label>
                        <input type="text" id="loginUsername" class="form-control" placeholder="Enter your username" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" class="form-control" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" class="btn">Login</button>
                </form>
            </div>
        </div>
    `;

    // Append modal HTML to the body
    $('body').append(modalHtml);

    // Show modal
    $('#loginModal').fadeIn();

    $('#loginModal').css({
        'width': '100%',
        'height': '100%',
        'position': 'fixed', // Fixed positioning
        'top': '0',
        'left': '0',
        'background-color': 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
        'z-index': '1000', // Higher z-index to ensure it's on top
    });

    // Close the modal when the close button or outside the modal is clicked
    $(document).on('click', '.close, .common-modal', function(e) {
        if (e.target === this) {
            $('#loginModal').fadeOut(function() {
                $(this).remove();
            });
        }
    });

    // Prevent default form submission
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        console.log('Login form submitted');
        var username = $('#loginUsername').val();
        var password = $('#loginPassword').val();
        login(username, password);
    });
}

function showSignupForm() {
    // Create a modal container div
    var modalHtml = `
        <div id="signupModal" class="modal2 common-model">
            <div class="modal-content2">
                <span class="close">&times;</span>
                <h2>Sign Up</h2>
                <form id="signupForm">
                    <div class="form-group">
                        <label for="signupUsername">Username</label>
                        <input type="text" id="signupUsername" class="form-control" placeholder="Enter your username" required>
                    </div>
                    <div class="form-group">
                        <label for="signupPassword">Password</label>
                        <input type="password" id="signupPassword" class="form-control" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" class="btn">Sign Up</button>
                </form>
            </div>
        </div>
    `;

    // Append modal HTML to the body
    $('body').append(modalHtml);

    // Show modal
    $('#signupModal').fadeIn();

    $('#loginModal').css({
        'width': '100%',
        'height': '100%',
        'top': '0',
        'left': '0',
        'background-color': 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
        'z-index': '1000', // Higher z-index to ensure it's on top
    });

    // Close the modal when the close button or outside the modal is clicked
    $(document).on('click', '.close, .common-modal', function(e) {
        if (e.target === this) {
            $('#signupModal').fadeOut(function() {
                $(this).remove();
            });
        }
    });

    // Prevent default form submission
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
            alert(response); // Display success message
            window.location.href = '/';
            checkLoggedIn();
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
            var errorMessage = xhr.responseJSON ? xhr.responseJSON.error : "An error occurred while logging in.";
            alert("Login failed: " + errorMessage); // Display error message
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
            alert(response); // Display success message
            window.location.href = '/';
            checkLoggedIn();
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
            var errorMessage = xhr.responseJSON ? xhr.responseJSON.error : "An error occurred while signing up.";
            alert("Signup failed: " + errorMessage); // Display error message
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
            var errorMessage = xhr.responseJSON ? xhr.responseJSON.error : "An error occurred while logging out.";
            alert("Logout failed: " + errorMessage); // Display error message
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
            alert("Search failed: " + error); // Display error message
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

function sanitizeInput(input) {
    return input.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
}
