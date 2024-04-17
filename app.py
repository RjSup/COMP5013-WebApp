# ====================
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
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

app.config.update(
    SESSION_COOKIE_SECURE=True,  # Ensure cookies are only sent over HTTPS
    SESSION_COOKIE_SAMESITE="None",  # Allow cookies to be sent in cross-site requests
)

# ====================
# SETUP
# ====================


def connectDB():
    try:
        conn = sqlite3.connect('debate.sqlite')
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print("SQLite connection error:", e)
        return None


# ====================
# FUNCTIONS
# ====================
# Check if the user is an admin based on the database
def isAdmin(request):
    if 'logged_in' in session:
        user_id = session.get('user_id')
        if user_id:
            conn = connectDB()
            if conn:
                try:
                    c = conn.cursor()
                    c.execute(
                        "SELECT isAdmin FROM user WHERE userID = ?", (user_id,))
                    user_data = c.fetchone()
                    conn.close()
                    if user_data:
                        return bool(user_data[0])
                except sqlite3.Error as e:
                    print("SQLite error:", e)
    return False


# Add user to database
def addUser(username, password, isAdmin):
    passwordHash = hash(password)
    creationTime = int(time.time())
    lastVisit = creationTime
    conn = connectDB()
    if conn:
        try:
            c = conn.cursor()
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
            c.execute("SELECT * FROM user WHERE userName = ?", (username,))
            user = c.fetchone()
            conn.close()

            if user:
                storedPassword = user[2]
                if hash(password) == storedPassword:
                    return user[0]  # Return user ID
        except sqlite3.Error as e:
            print("SQLite error:", e)
    return None


# Get the user ID based on session data
def getUserId(request):
    if 'logged_in' in session:
        return session.get('user_id', None)
    return None


# Hash the user password using SHA-256
def hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

# ====================
# ROUTES
# ====================

# Logout route


@app.route("/logout", methods=["GET", "POST"])
def logout():
    session.pop('user_id', None)
    session.pop('logged_in', None)
    return redirect("/")


# Landing page route
@app.route("/")
def landingPage():
    return render_template('landing.html')


# Signup page route with form validation
@app.route("/signup", methods=["POST"])
def signup():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        # Basic form validation
        if not username or not password:
            return "Username and password are required", 400

        # Input sanitization
        username = username.strip()  # Strip leading and trailing spaces
        password = password.strip()  # Strip leading and trailing spaces

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
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        # Basic form validation
        if not username or not password:
            return "Username and password are required", 400

        # Input sanitization
        username = username.strip()  # Strip leading and trailing spaces
        password = password.strip()  # Strip leading and trailing spaces

        # Proceed with login
        user_id = authUser(username, password)
        if user_id:
            session['user_id'] = user_id
            session['logged_in'] = True
            return "login successful"
        else:
            return "login failed"
    else:
        return "Please log in"


# Check if user is logged in
@app.route("/check-login")
def checkLogin():
    if 'logged_in' in session and session['logged_in']:
        user_id = session['user_id']
        return jsonify({"logged_in": True, "is_admin": isAdmin(user_id)})
    else:
        session.pop('logged_in', None)
        return jsonify({"logged_in": False})


# Add topic route with admin validation
@app.route("/add_topic", methods=["POST"])
def add_topic():
    if request.method == "POST":
        if isAdmin(request):
            topicName = request.form["topicName"]
            postingUser = getUserId(request)
            creationTime = int(time.time())
            updateTime = creationTime

            # Basic form validation
            if not topicName:
                return "Topic name is required", 400

            # Input sanitization
            topicName = topicName.strip()  # Strip leading and trailing spaces

            # Proceed with adding topic
            conn = connectDB()
            if conn:
                try:
                    c = conn.cursor()
                    c.execute("INSERT INTO topic (topicName, postingUser, creationTime, updateTime) VALUES (?, ?, ?, ?)",
                              (topicName, postingUser, creationTime, updateTime))
                    conn.commit()
                    conn.close()
                    return "success"
                except sqlite3.Error as e:
                    print("SQLite error:", e)
                    return "Failed to add topic. Please try again later.", 500
        else:
            return "Only admins can add topics"
    else:
        return "Invalid request method"


# Fetch topics route
@app.route("/fetch_topics")
def fetch_topics():
    conn = connectDB()
    if conn:
        try:
            c = conn.cursor()
            c.execute(
                "SELECT topic.topicName, user.userName FROM topic JOIN user ON topic.postingUser = user.userID")
            topics = [{'topicName': row[0], 'postingUser': row[1]}
                      for row in c.fetchall()]
            conn.close()
            return jsonify({'topics': topics})
        except sqlite3.Error as e:
            print("SQLite error:", e)
    return "Failed to fetch topics. Please try again later.", 500


# Route to render topic page
@app.route("/topic/<topic_name>")
def topic_page(topic_name):
    return render_template('topic.html', topic_name=topic_name)


# Update the route for fetching claims to accept the topic name
@app.route("/fetch_claims/<topic_name>")
def fetch_claims(topic_name):
    conn = connectDB()
    if conn:
        try:
            c = conn.cursor()
            c.execute("SELECT claim.topic, claim.postingUser, claim.text FROM claim JOIN topic ON claim.topic = topic.topicName WHERE topic.topicName = ?", (topic_name,))
            claims = [{'topic': row[0], 'postingUser': row[1],
                       'claimText': row[2]} for row in c.fetchall()]
            conn.close()
            return jsonify({'claims': claims})
        except sqlite3.Error as e:
            print("SQLite error:", e)
    return "Failed to fetch claims. Please try again later.", 500


# Add claim route with user authentication and form validation
@app.route("/add_claim", methods=["POST"])
def add_claim():
    if request.method == "POST":
        if 'user_id' in session:
            topic_name = request.form.get('topic_name')
            claim_text = request.form.get("claimText")
            posting_user = session['user_id']
            creation_time = int(time.time())
            update_time = creation_time

            # Basic form validation
            if not topic_name or not claim_text:
                return "Topic name and claim text are required", 400

            wrapped_claim_text = "\n".join(textwrap.wrap(claim_text, width=50))

            conn = connectDB()
            if conn:
                try:
                    c = conn.cursor()
                    c.execute("INSERT INTO claim (topic, postingUser, creationTime, updateTime, text) VALUES (?, ?, ?, ?, ?)",
                              (topic_name, posting_user, creation_time, update_time, wrapped_claim_text))
                    conn.commit()
                    conn.close()
                    return "success"
                except sqlite3.Error as e:
                    print("SQLite error:", e)
                    return "Failed to add claim. Please try again later.", 500
        else:
            return "Please log in to add a claim"
    else:
        return "Invalid request method"


# Searchbar functionality
@app.route('/search')
def search():
    search_term = request.args.get('term')

    conn = connectDB()
    if conn:
        try:
            c = conn.cursor()
            c.execute("SELECT * FROM topic WHERE topicName LIKE ?",
                      ('%' + search_term + '%',))
            topic_results = c.fetchall()

            c.execute("SELECT * FROM claim WHERE text LIKE ?",
                      ('%' + search_term + '%',))
            claim_results = c.fetchall()

            c.close()

            results = {
                'topics': [dict(row) for row in topic_results],
                'claims': [dict(row) for row in claim_results]
            }

            return jsonify(results=results)

        except sqlite3.Error as e:
            print("SQLite error:", e)

            return "Failed to add claim. Please try again later.", 500


# Add reply route to submit a reply to a claim
@app.route("/submit_reply", methods=["POST"])
def submit_reply():
    if request.method == "POST":
        if 'user_id' in session:
            reply_text = request.form.get('replyText')
            posting_user = session['user_id']
            creation_time = int(time.time())
            reply_type = request.form.get('replyType')
            topic_name = request.form.get('topicName')

            # Basic form validation
            if not reply_text or not reply_type:
                return "Reply text and type are required", 400

            conn = connectDB()
            if conn:
                try:
                    c = conn.cursor()
                    # Insert into replyToClaim table
                    c.execute("INSERT INTO replyText (postingUser, creationTime, text) VALUES (?, ?, ?)",
                              (posting_user, creation_time, reply_text))
                    reply_to_claim_id = c.lastrowid  # Get the ID of the inserted row

                    # Insert into replyToClaimType table
                    c.execute("INSERT INTO replyToClaim (replyToClaimID, reply, claim, replyToClaimRelType) VALUES (?, ?, ?, ?)",
                              (reply_to_claim_id, reply_text, topic_name, reply_type))
                    conn.commit()
                    conn.close()
                    return "success"
                except sqlite3.Error as e:
                    print("SQLite error:", e)
                    return "Failed to submit reply. Please try again later.", 500
        else:
            return "Please log in to submit a reply"
    else:
        return "Invalid request method"


@app.route("/fetch_replies/<topic_name>")
def fetch_replies(topic_name):
    # Get the claim text from the request
    claim_text = request.args.get('claimText')
    conn = connectDB()
    if conn:
        try:
            c = conn.cursor()
            c.execute("""
                SELECT reply.text, reply.postingUser, rel.replyToClaimRelType 
                FROM replyText AS reply 
                JOIN replyToClaim AS rel ON reply.replyTextID = rel.replyToClaimID 
                JOIN claim ON claim.text = rel.claim 
                WHERE claim.topic = ? AND claim.text = ?
            """, (topic_name, claim_text))
            replies = [{'text': row[0], 'postingUser': row[1],
                        'replyType': row[2]} for row in c.fetchall()]
            conn.close()
            return jsonify({'replies': replies})
        except sqlite3.Error as e:
            print("SQLite error:", e)
    return "Failed to fetch replies. Please try again later.", 500


# Start app
if __name__ == "__main__":
    app.run(debug=True)
