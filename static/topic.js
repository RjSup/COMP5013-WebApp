$(document).ready(function() {
    console.log('Topics ready');
    checkLoggedIn();
    setupAuthLinks();
    setupTopicPage();
    setupClaimEvents();
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

function setupTopicPage() {
    var topicName = decodeURIComponent(document.title.split(' | ')[1].trim()); // Decode the topic name
    $('.topicHeader h1').text(topicName);
    fetchClaims(topicName);
}

function setupClaimEvents() {
    $(document).on('click', '#addClaimButton', function(event) {
        event.preventDefault();
        addClaim();
    });

    $(document).on('click', '.card', function() {
        showClaimDetails($(this).find('p:first').text().trim());
    });

    $('.close, .modal2').on('click', function(event) {
        if (event.target === this) {
            $('#claimModal').css('display', 'none');
        }
    });

    $(document).on('submit', '#replyForm', function(event) {
        event.preventDefault();
        submitReplyForm();
    });
}

function addClaim() {
    var claimText = $('#claimText').val().trim();
    var postingUser = $('#currentUserId').val();
    var topicName = $('.addClaimForm').data('topic');

    // Sanitize claim text to prevent XSS attacks
    claimText = sanitizeInput(claimText);

    // Validate if claim text is not empty
    if (!claimText) {
        console.log("Claim text cannot be empty");
        return; // Exit the function if claim text is empty
    }

    // Check claim text length
    if (claimText.length > 500) { // Set the maximum length (e.g., 500 characters)
        console.log("Claim text is too long");
        return; // Exit the function if claim text is too long
    }

    $.ajax({
        url: '/add_claim',
        type: 'POST',
        data: {
            topic_name: topicName, // Use the original topic name
            claimText: claimText,
            postingUser: postingUser
        },
        success: function(response) {
            console.log('Add claim success:', response);
            fetchClaims(topicName);
            $('#claimText').val('');
        },
        error: function(xhr, status, error) {
            console.error("Error adding claim:", xhr.responseText);
            alert("Failed to add claim: " + xhr.responseText); // Display an alert with the error message
        }
    });
}

function showClaimDetails(claimText) {
    var topicName = decodeURIComponent(document.title.split(' | ')[1].trim()); // Decode the topic name
    $('#claimDetail').text(claimText);
    $('#claimModal').css('display', 'block');

    console.log('Topic Name:', topicName);
    console.log('Claim Text:', claimText);

    fetchReplies(topicName, claimText);
}

function submitReplyForm() {
    var replyText = $('#replyText').val().trim();
    var replyType = $('input[name="replyType"]:checked').val();
    var topicName = decodeURIComponent($('#claimDetail').text().trim()); // Decode the topic name

    // Validate if reply text is not empty
    if (!replyText) {
        console.log("Reply text cannot be empty");
        return; // Exit the function if reply text is empty
    }

    // Check reply text length
    if (replyText.length > 300) { // Set the maximum length (e.g., 300 characters)
        console.log("Reply text is too long");
        return; // Exit the function if reply text is too long
    }

    if (replyText && replyType && topicName) {
        submitReply(replyText, replyType, topicName);
    } else {
        console.log("Error");
    }
}

function fetchClaims(topicName) {
    $.ajax({
        type: 'GET',
        url: '/fetch_claims/' + topicName,
        success: function(response) {
            console.log('Fetch claims response:', response);
            renderClaims(response.claims);
        },
        error: function(xhr, status, error) {
            console.error("Error fetching claims:", xhr.responseText);
            alert("Failed to fetch claims: " + xhr.responseText); // Display an alert with the error message
        }
    });
}

function renderClaims(claims) {
    var $cardGrid = $('#card-grid').empty();

    claims.forEach(function(claim, index) {
        var claimElement = $('<div class="card">' +
            '<p>' + claim.claimText + '<p>' +
            '<p>Posting User: ' + claim.postingUser + '</p>' +
            '</div>');

        $cardGrid.append(claimElement);
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
            'cursor': 'pointer'
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

function submitReply(replyText, replyType, topicName) {
    $.ajax({
        type: 'POST',
        url: '/submit_reply',
        data: {
            replyText: replyText,
            replyType: replyType,
            topicName: topicName
        },
        success: function(response) {
            console.log('Reply submission success:', response);
            $('#claimModal').css('display', 'none');
        },
        error: function(xhr, status, error) {
            console.error("Error submitting reply:", xhr.responseText);
            alert("Failed to submit reply: " + xhr.responseText); // Display an alert with the error message
        }
    });
}

function fetchReplies(topicName, claimText) {
    $.ajax({
        type: 'GET',
        url: '/fetch_replies/' + topicName,
        data: {
            claimText: claimText
        },
        success: function(response) {
            console.log('Fetch replies response:', response);
            renderReplies(response.replies);
        },
        error: function(xhr, status, error) {
            console.error("Error fetching replies:", xhr.responseText);
            alert("Failed to fetch replies: " + xhr.responseText); // Display an alert with the error message
        }
    });
}

function renderReplies(replies) {
    var $claimReplies = $('#claimReplies').empty();

    replies.forEach(function(reply) {
        var replyElement = $('<div class="reply"></div>'); // Container for entire reply

        // Main comment text
        var commentElement = $('<p class="comment" style="margin-bottom: 10px;">Reply: ' + reply.text + '</p>');
        
        // Set text color based on reply type
        if (reply.replyType === 1) {
            commentElement.css('color', 'blue'); // Clarification
        } else if (reply.replyType === 2) {
            commentElement.css('color', 'green'); // Supporting Argument
        } else if (reply.replyType === 3) {
            commentElement.css('color', 'red'); // Counterargument
        }
        
        replyElement.append(commentElement);

        // Add the posting user's name
        var userNameElement = $('<p class="userName" style="margin-bottom: 10px;">Posted by: ' + reply.postingUser + '</p>');
        replyElement.append(userNameElement);

        // Add reply type directly based on the replyType field from the response
        var replyTypeElement;
        if (reply.replyType === 1) {
            replyTypeElement = $('<p class="replyType clarification" style="margin-bottom: 10px;">Clarification</p>');
        } else if (reply.replyType === 2) {
            replyTypeElement = $('<p class="replyType supportingArgument" style="margin-bottom: 10px;">Supporting Argument</p>');
        } else if (reply.replyType === 3) {
            replyTypeElement = $('<p class="replyType counterargument" style="margin-bottom: 10px;">Counterargument</p>');
        } else {
            replyTypeElement = $('<p class="replyType against" style="margin-bottom: 10px;">Against</p>');
        }
        replyElement.append(replyTypeElement);

        // Add "Reply to Claim" button with modern styling
        var replyButton = $('<button class="btnbtn replyToClaimButton">Reply to Claim</button>');
        replyElement.append(replyButton);

        // Add reply form
        var replyForm = $('<form class="replyForm" style="display: none;"></form>'); // Initially hidden
        var replyTextArea = $('<textarea class="replyText" style="height: 150px; margin-bottom: 10px;" placeholder="Your reply"></textarea>'); // Increase height
        var replyTypeSelect = $('<select class="replyType btnbtn" style="margin-bottom: 10px;"></select>').append('<option value="1">Reply to Comment</option>');
        var submitButton = $('<button class="btnbtn replyButton" type="submit">Reply</button>');

        replyForm.append(replyTextArea, '<br>', replyTypeSelect, '<br>', submitButton);
        replyElement.append(replyForm);

        // Toggle reply form visibility when "Reply to Claim" button is clicked
        replyButton.click(function() {
            replyForm.toggle(); // Toggle visibility
        });

        // Submit reply form
        replyForm.submit(function(event) {
            event.preventDefault();
            var replyText = replyTextArea.val();
            var replyType = replyTypeSelect.val();
            // Implement your logic to handle the reply submission
            // You can use replyText and replyType variables to send the data to the server
            console.log('Reply Text:', replyText);
            console.log('Reply Type:', replyType);
            // Clear reply input after submission
            replyTextArea.val('');
        });

        // Add spacing and border around each reply
        replyElement.css({
            'border': '1px solid #ccc',
            'padding': '10px',
            'border-radius': '5px',
            'margin-bottom': '20px', // Add spacing between replies
            'margin-top': '20px' // Add padding to the top
        });

        // Add margin between elements inside reply form
        replyForm.children().css('margin-bottom', '10px');

        $claimReplies.append(replyElement);
    });
}
