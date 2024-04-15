$(document).ready(function() {
    console.log('Document is ready');
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
    var topicName = document.title.split(' | ')[1].trim();
    $('.topicHeader h1').text(topicName);
    fetchClaims(topicName);
}

function setupClaimEvents() {
    $(document).on('click', '#addClaimButton', function(event) {
        event.preventDefault();
        addClaim();
    });

    $(document).on('click', '.card', function() {
        showClaimDetails();
    });

    $('.close, .modal').on('click', function(event) {
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
            fetchClaims(topicName);
            $('#claimText').val('');
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

function showClaimDetails() {
    var claimText = $(this).find('p:first').text();
    $('#claimDetail').text(claimText);
    $('#claimModal').css('display', 'block');
}

function submitReplyForm() {
    var replyText = $('#replyText').val().trim();
    var replyType = $('input[name="replyType"]:checked').val();
    var topicName = $('#claimDetail').text();

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
            console.error("Error:", error);
        }
    });
}

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
            // Handle success, maybe show a confirmation message
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
            // Handle error, maybe show an error message to the user
        }
    });
}
