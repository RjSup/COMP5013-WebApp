# IMPORTS
# ====================
import os
import time
import sqlite3
import hashlib
import textwrap
from flask import Flask, render_template, request, redirect, jsonify, session

# ====================
# APP SET UP
# ====================


#  # Create the flask app
app = Flask(__name__)
# Set up secret key for session management
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Setting up secure cookies
app.config.update(
    # Cookies sent only over HTTPS
    SESSION_COOKIE_SECURE=True,
    # Allow cookies to be sent in cross-site requests
    SESSION_COOKIE_SAMESITE="None",
)

# ====================
# SETUP
# ====================


# Create a connection to a SQLite database
def connectDB():
    try:
        conn = sqlite3.connect('debate.sqlite')
        conn.row_factory = sqlite3.Row
        print("SQLite connection established")
        return conn
    except sqlite3.Error as e:
        print("SQLite connection error:", e)
        return None


# ====================
# FUNCTIONS
# ====================


# Check if the user is an admin based on the database
def isAdmin(request):
    # If user is logged in
    if 'logged_in' in session:
        # Get the user ID from the session
        user_id = session.get('user_id')
        # If a user ID is found
        if user_id:
            # Then connect to the database
            conn = connectDB()
            # If connection is successful
            if conn:
                # try to receive the users data
                try:
                    # Create a cursor object
                    c = conn.cursor()
                    # Query user table for isAdmin column where userID matches the session user ID
                    c.execute(
                        "SELECT isAdmin FROM user WHERE userID = ?", (user_id,))
                    # Fetch the data
                    user_data = c.fetchone()
                    # Close the connection
                    conn.close()
                    # If no data found
                    if user_data:
                        # Return the isAdmin column value
                        return bool(user_data[0])
                # If error receiving information
                except sqlite3.Error as e:
                    # Print the error
                    print("SQLite error:", e)
    return False


# Add user to database
def addUser(username, password, isAdmin):
    # Hash the password
    passwordHash = hash(password)
    # Get the current time
    creationTime = int(time.time())
    # Set the last visit time to the creation time
    lastVisit = creationTime

    conn = connectDB()
    # If connection is successful
    if conn:
        #§ Try to add the user to the database
        try:
            c = conn.cursor()
            # query the user table to insert the user data
            c.execute("INSERT INTO user (userName, passwordHash, isAdmin, creationTime, lastVisit) VALUES (?, ?, ?, ?, ?)",
                      (username, passwordHash, isAdmin, creationTime, lastVisit))
            conn.commit()
            conn.close()
            return True
        except sqlite3.Error as e:
            print("SQLite error:", e)
    return False


# Authenticate user
def authUser(username, password):
    conn = connectDB()
    if conn:
        try:
            c = conn.cursor()
            # Query the user table for the user data where the username matches the input
            c.execute("SELECT * FROM user WHERE userName = ?", (username,))
            user = c.fetchone()
            conn.close()

            # If user is found
            if user:
                # Get the stored password for the user
                storedPassword = user[2]
                # Check if input password matches the stored password
                if hash(password) == storedPassword:
                    # return that users ID
                    return user[0]
        except sqlite3.Error as e:
            print("SQLite error:", e)
    return None


# Get the user ID based on session data
def getUserId(request):
    # If user is logged in
    if 'logged_in' in session:
        # Return the user ID from the session
        return session.get('user_id', None)
    return None


# Hash the user password using SHA-256
def hash(password):
    # Encode the password and hash it using SHA-256
    return hashlib.sha256(password.encode()).hexdigest()

# ====================
# ROUTES
# ====================


# Landing page route
@app.route("/")
def landingPage():
    # Render the landing page
    return render_template('landing.html')


# Signup page route with form validation
@app.route("/signup", methods=["POST"])
def signup():
    # If the request method is POST
    if request.method == "POST":
        # Get the username and password from the form
        username = request.form["username"]
        password = request.form["password"]

        # Basic form validation
        if not username or not password:
            return "Username and password are required", 400

        # Input sanitization by stripping leading and trailing spaces
        username = username.strip()
        password = password.strip()

        # Check if username is alphanumeric
        if not username.isalnum():
            return "Username should contain only alphanumeric characters", 400

        # Check if password meets complexity requirements
        if len(password) < 4:
            return "Password should be at least 4 characters long", 400

        # Proceed with signup
        if not addUser(username, password, isAdmin=False):
            return "Failed to sign up. Please try again later.", 500

        return "success"
    else:
        return "Please sign up"


# Login route with form validation
@app.route("/login", methods=["POST"])
def login():
    # If the request method is POST
    if request.method == "POST":
        # Get the username and password from the form
        username = request.form["username"]
        password = request.form["password"]

        # Basic form validation
        if not username or not password:
            return "Username and password are required", 400

        # Input sanitization by stripping leading and trailing spaces
        username = username.strip()
        password = password.strip()

        # ensure user is in datbase
        user_id = authUser(username, password)
        # If user is found
        if user_id:
            # Set the user ID in the session
            session['user_id'] = user_id
            # Set the logged in status in the session
            session['logged_in'] = True
            return "login successful"
        else:
            return "login failed"
    else:
        return "Please log in"



# Check if user is logged in
@app.route("/check-login")
def checkLogin():
    # If user is logged in
    if 'logged_in' in session and session['logged_in']:
        # Get the user ID from the session
        user_id = session['user_id']
        # Return the logged in status and if the user is an admin
        return jsonify({"logged_in": True, "is_admin": isAdmin(user_id)})
    else:
        # Return the logged in status as false
        session.pop('logged_in', None)
        # Return the logged in status as false
        return jsonify({"logged_in": False})



# Logout route
@app.route("/logout", methods=["GET", "POST"])
def logout():
    # Clear the session data
    session.pop('user_id', None)
    # Clear the session data
    session.pop('logged_in', None)
    # Redirect to the landing page
    return redirect("/")


@app.route("/add_topic", methods=["POST"])
def add_topic():
    # If the request method is POST
    if request.method == "POST":
        # If user is an admin
        # # Get the topic name from the form
        topicName = request.form["topicName"]
        # Get the user ID from the session
        postingUser = getUserId(request)
        # Get the current time
        creationTime = int(time.time())

        updateTime = creationTime

        # Basic form validation
        if not topicName:
            return jsonify({"error": "Topic name is required"}), 400

        # Input sanitization by stripping leading and trailing spaces
        topicName = topicName.strip()

        # Proceed with adding topic
        conn = connectDB()
        if conn:
            try:
                c = conn.cursor()
                # Insert the topic data into the topic table
                c.execute("INSERT INTO topic (topicName, postingUser, creationTime, updateTime) VALUES (?, ?, ?, ?)",
                          (topicName, postingUser, creationTime, updateTime))
                conn.commit()
                conn.close()
                return jsonify({"success": "Topic added successfully"})
            except sqlite3.Error as e:
                print("SQLite error:", e)
                return jsonify({"error": "Failed to add topic. Please try again later."}), 500

    # Return an error if the request method is not POST
    return jsonify({"error": "Invalid request method"}), 405


# Fetch topics route
@app.route("/fetch_topics")
def fetch_topics():
    conn = connectDB()
    if conn:
        try:
            c = conn.cursor()
            # Fetch the topic name and posting user from the topic and user tables
            c.execute("""
                SELECT topic.topicName, user.userName
                FROM topic
                JOIN user ON topic.postingUser = user.userID
                ORDER BY topic.updateTime DESC
            """)
            topics = [{'topicName': row[0], 'postingUser': row[1]}
                      for row in c.fetchall()]
            conn.close()
            # Return the topics as JSON
            return jsonify({'topics': topics})
        except sqlite3.Error as e:
            print("SQLite error:", e)
    # Return an error if the topics cannot be fetched
    return "Failed to fetch topics. Please try again later.", 500


# Route to render topic page
@app.route("/topic/<topic_name>")
def topic_page(topic_name):
    # Render the topic page
    return render_template('topic.html', topic_name=topic_name)


# Update the route for fetching claims to accept the topic name
@app.route("/fetch_claims/<topic_name>")
def fetch_claims(topic_name):
    conn = connectDB()
    if conn:
        try:
            c = conn.cursor()
            # Fetch the topic, posting user, and claim text from the claim and user tables
            c.execute("""
                SELECT claim.topic, user.userName, claim.text
                FROM claim
                JOIN user ON claim.postingUser = user.userID
                WHERE claim.topic = ?
                ORDER BY claim.updateTime DESC
            """, (topic_name,))
            # store the fetched data in a list of dictionaries called claims
            claims = [{'topic': row[0], 'postingUser': row[1],
                       'claimText': row[2]} for row in c.fetchall()]
            conn.close()
            # Return the claims as JSON
            return jsonify({'claims': claims})
        except sqlite3.Error as e:
            print("SQLite error:", e)
    # Return an error if the claims cannot be fetched
    return "Failed to fetch claims. Please try again later.", 500


# Add claim route with user authentication and form validation
@app.route("/add_claim", methods=["POST"])
def add_claim():
    # If the request method is POST
    if request.method == "POST":
        # If user is logged in
        if 'user_id' in session:
            # Get the topic name, claim text, and posting user from the form
            topic_name = request.form.get('topic_name')
            claim_text = request.form.get("claimText")
            posting_user = session['user_id']
            creation_time = int(time.time())
            update_time = creation_time

            # Basic form validation
            if not topic_name or not claim_text:
                return "Topic name and claim text are required", 400

            # wrap the claim text to 50 characters
            wrapped_claim_text = "\n".join(textwrap.wrap(claim_text, width=50))

            conn = connectDB()
            if conn:
                try:
                    c = conn.cursor()
                    # Insert the claim data into the claim table
                    c.execute("INSERT INTO claim (topic, postingUser, creationTime, updateTime, text) VALUES (?, ?, ?, ?, ?)",
                              (topic_name, posting_user, creation_time, update_time, wrapped_claim_text))
                    conn.commit()
                    conn.close()
                    return "success"
                except sqlite3.Error as e:
                    print("SQLite error:", e)
                    # Return an error message if the claim could not be added
                    return "Failed to add claim. Please try again later.", 500
        else:
            return "Please log in to add a claim"

    return "Invalid request method"


# Searchbar functionality
@app.route('/search', methods=['GET'])
def search():
    # Get the search term from the query string
    search_term = request.args.get('term')

    conn = connectDB()
    if conn:
        try:
            c = conn.cursor()
            # Check if search_term is not None and is a string
            if search_term is not None and isinstance(search_term, str):
                # Search for topics and claims that contain the search term
                c.execute("SELECT * FROM topic WHERE topicName LIKE ?", ('%' + search_term + '%',))
                topic_results = c.fetchall()

                # Search for claims that contain the search term
                c.execute("SELECT * FROM claim WHERE text LIKE ?", ('%' + search_term + '%',))
                claim_results = c.fetchall()

                c.close()
                # Return the results as JSON called results
                results = {
                    'topics': [dict(row) for row in topic_results],
                    'claims': [dict(row) for row in claim_results]
                }

                # Return the results as JSON
                return jsonify(results=results)
            else:
                # Handle the case when search_term is None or not a string
                print("Invalid search term provided.")

        except sqlite3.Error as e:
            print("SQLite error:", e)

            return "Failed to perform the search. Please try again later.", 500
    # error 500
    return "Failed to perform the search. Please try again later.", 500


@app.route("/submit_reply", methods=["POST"])
def submit_reply():
    # Check if the request method is POST
    if request.method == "POST":
        # Check if the user is logged in
        if 'user_id' in session:
            # Get the reply text, reply type, and topic name from the form
            reply_text = request.form.get('replyText')
            reply_type = request.form.get('replyType')
            topic_name = request.form.get('topicName')

            # Basic validation: Check if required fields are present
            if not (reply_text and reply_type and topic_name):
                return jsonify({"error": "Reply text, reply type, and topic name are required"}), 400

            # Get the posting user and current time
            posting_user = session['user_id']
            creation_time = int(time.time())

            conn = connectDB()
            if conn:
                try:
                    c = conn.cursor()
                    # Insert the data into the replyText table
                    c.execute("INSERT INTO replyText (postingUser, creationTime, text) VALUES (?, ?, ?)",
                              (posting_user, creation_time, reply_text))
                    # Get the ID of the inserted row
                    reply_to_claim_id = c.lastrowid

                    # Insert the data into replyToClaim table
                    c.execute("INSERT INTO replyToClaim (replyToClaimID, reply, claim, replyToClaimRelType) VALUES (?, ?, ?, ?)",
                              (reply_to_claim_id, reply_text, topic_name, reply_type))
                    conn.commit()
                    conn.close()
                    return jsonify({"success": "Reply submitted successfully"})
                except sqlite3.Error as e:
                    print("SQLite error:", e)
                    # Error 400
                    return jsonify({"error": "Failed to submit reply. Please try again later."}), 500
        else:
            return jsonify({"error": "Please log in to submit a reply"})

    # Method Not Allowed 400
    return jsonify({"error": "Invalid request method"}), 405



@app.route("/fetch_replies/<topic_name>")
def fetch_replies(topic_name):
    # Get the claim text from the request
    claim_text = request.args.get('claimText')
    conn = connectDB()
    if conn:
        try:
            c = conn.cursor()
            # Fetch the replies for the given topic and claim
            c.execute("""
                SELECT reply.text, user.userName, rel.replyToClaimRelType
                FROM replyText AS reply
                JOIN replyToClaim AS rel ON reply.replyTextID = rel.replyToClaimID
                JOIN claim ON claim.text = rel.claim
                JOIN user ON reply.postingUser = user.userID
                WHERE claim.topic = ? AND claim.text = ?
            """, (topic_name, claim_text))

            # Store the replies in a list of dictionaries called replies
            replies = [{'text': row[0], 'postingUser': row[1],
                        'replyType': row[2]} for row in c.fetchall()]
            conn.close()
            # Return the replies as JSON
            return jsonify({'replies': replies})
        except sqlite3.Error as e:
            print("SQLite error:", e)
    # error 500
    return "Failed to fetch replies. Please try again later.", 500



# Start app
if __name__ == "__main__":
    app.run(debug=True)
