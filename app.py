# ====================
# IMPORTS
# ====================
import os
import time
from flask import Flask, render_template, request, redirect, jsonify, session
import sqlite3
import hashlib
import textwrap

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
    conn = sqlite3.connect('debate.sqlite')
    conn.row_factory = sqlite3.Row
    return conn

# ====================
# FUNCTIONS
# ====================
# Check if the user is an admin based on the database
def isAdmin(request):
    if 'logged_in' in session:
        user_id = session.get('user_id')
        if user_id:
            conn = connectDB()
            c = conn.cursor()
            c.execute("SELECT isAdmin FROM user WHERE userID = ?", (user_id,))
            user_data = c.fetchone()
            conn.close()
            if user_data:
                return bool(user_data[0])
    return False

# Add user to database
def addUser(username, password, isAdmin):
    passwordHash = hash(password)
    creationTime = int(time.time())
    lastVisit = creationTime
    if isAdmin:
        isAdmin = True
    else:
        isAdmin = False
    conn = connectDB()
    c = conn.cursor()
    c.execute("INSERT INTO user (userName, passwordHash, isAdmin, creationTime, lastVisit) VALUES (?, ?, ?, ?, ?)",
              (username, passwordHash, isAdmin, creationTime, lastVisit))
    conn.commit()
    conn.close()

# Authenticate user
def authUser(username, password):
    conn = connectDB()
    c = conn.cursor()
    c.execute("SELECT * FROM user WHERE userName = ?", (username,))
    user = c.fetchone()
    conn.close()

    if user:
        storedPassword = user[2]
        if hash(password) == storedPassword:
            return user[0]  # Return user ID
    return None

# Get the user ID based on session data
def getUserId(request):
    if 'logged_in' in session:
        return session.get('user_id', None)
    return None


# Hash the user password
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

# Signup page route
@app.route("/signup", methods=["POST"])
def signup():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        addUser(username, password, isAdmin=False)
        return "success"
    else:
        return "Please sign up"

# Login route
@app.route("/login", methods=["POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
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
    

# Add topic route
@app.route("/add_topic", methods=["POST"])
def add_topic():
    if request.method == "POST":
        if isAdmin(request):  
            topicName = request.form["topicName"]
            postingUser = getUserId(request)
            creationTime = int(time.time())
            updateTime = creationTime
            conn = connectDB()
            c = conn.cursor()
            c.execute("INSERT INTO topic (topicName, postingUser, creationTime, updateTime) VALUES (?, ?, ?, ?)",
                      (topicName, postingUser, creationTime, updateTime))
            conn.commit()
            conn.close()
            return "success"
        else:
            return "Only admins can add topics"
    else:
        return "Invalid request method"



@app.route("/fetch_topics")
def fetch_topics():
    conn = connectDB()
    c = conn.cursor()
    c.execute("SELECT topic.topicName, user.userName FROM topic JOIN user ON topic.postingUser = user.userID")
    topics = [{'topicName': row[0], 'postingUser': row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify({'topics': topics})



# New route to handle topic pages
@app.route("/topic/<topic_name>")
def topic_page(topic_name):
        return render_template('topic.html', topic_name=topic_name)



# Update the route for fetching claims to accept the topic name
@app.route("/fetch_claims/<topic_name>")
def fetch_claims(topic_name):
    conn = connectDB()
    c = conn.cursor()
    c.execute("SELECT claim.topic, claim.postingUser, claim.text FROM claim JOIN topic ON claim.topic = topic.topicName WHERE topic.topicName = ?", (topic_name,))
    claims = [{'topic': row[0], 'postingUser': row[1], 'claimText': row[2]} for row in c.fetchall()]
    conn.close()
    return jsonify({'claims': claims})


@app.route("/add_claim", methods=["POST"])
def add_claim():
    if request.method == "POST":
        if 'user_id' in session:
            topic_name = request.form.get('topic_name')
            claim_text = request.form.get("claimText")
            posting_user = session['user_id']
            creation_time = int(time.time())
            update_time = creation_time
            
            if topic_name is None:
                return "Topic name is missing", 400
            
            wrapped_claim_text = "\n".join(textwrap.wrap(claim_text, width=50))

            conn = connectDB()
            c = conn.cursor()
            c.execute("INSERT INTO claim (topic, postingUser, creationTime, updateTime, text) VALUES (?, ?, ?, ?, ?)",
                      (topic_name, posting_user, creation_time, update_time, wrapped_claim_text))
            conn.commit()
            conn.close()
            return "success"
        else:
            return "Please log in to add a claim"
    else:
        return "Invalid request method"


# Start app
if __name__ == "__main__":
    app.run(debug=True)
