#* ====================
#* IMPORTS
#* ====================
import os
import time
from flask import Flask, render_template, request, redirect, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import sqlite3
import hashlib
from dotenv import load_dotenv
#* ====================
#* APP SET UP
#* ====================
load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

login_manager = LoginManager()
login_manager.init_app(app)
#* ====================
#* SETUP
#* ====================

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, id):
        self.id = id

# login_manager callback to reload the user object from the user ID stored in the session
@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

global isAdmin

#* ====================
#* FUNCTIONS
#* ====================
# Add user to database
def addUser(username, password):
    # Hash the user's password
    passwordHash = hash(password)
    # Get the current time
    creationTime = int(time.time())
    # Use the current time as the last visit time
    lastVisit = creationTime
    # Users shouldn't be admins
    isAdmin = False
    # Connect to the database
    conn = sqlite3.connect('debate.sqlite')
    # Create a cursor object
    c = conn.cursor()
    # Insert the user into the database
    c.execute("INSERT INTO user (userName, passwordHash, isAdmin, creationTime, lastVisit) VALUES (?, ?, ?, ?, ?)",
              (username, passwordHash, isAdmin, creationTime, lastVisit))
    # Commit the changes
    conn.commit()
    # Close the connection
    conn.close()
    
    
@app.route("/add_admin", methods=["GET","POST"])
def add_admin():
    if request.method == "GET":
        return render_template("admin.html")
    
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        
        addUser(username, password, isAdmin=True)
        return "Success"
    else:
        return "Why are you here?"    

# Authenticate user
def authUser(username, password):
    conn = sqlite3.connect('debate.sqlite')
    c = conn.cursor()
    c.execute("SELECT * FROM user WHERE userName = ?", (username,))
    user = c.fetchone()
    conn.close()
    
    if user:
        storedPassword = user[2]
        if hash(password) == storedPassword:
            return User(user[0])
    return None

# Check if user is admin
def isAdmin():
    if current_user.is_authenticated:
        conn = sqlite3.connect('debate.sqlite')
        c = conn.cursor()
        c.execute("SELECT isAdmin FROM user WHERE userID = ?", (current_user.id,))
        isAdmin = c.fetchone()[0]
        conn.close()
        return isAdmin
    return False

# Hash the user password
def hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

#* ====================
#* ROUTES
#* ====================
# Logout route
@app.route("/logout", methods=["GET", "POST"])
@login_required
def logout():
    logout_user()
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
        
        addUser(username, password)
        return "success"

# Login route
@app.route("/login", methods=["POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        
        user = authUser(username, password)
        if user:
            login_user(user)
            return "login successful"
        else:
            return "login failed"

# Check if user is logged in
@app.route("/check-login")
def checkLogin():
    if current_user.is_authenticated:
        return jsonify({"logged_in": True, "is_admin": isAdmin()})
    else:
        return jsonify({"logged_in": False})

# Add topic route
@app.route("/add_topic", methods=["POST"])
@login_required
def add_topic():
    if request.method == "POST":
        if isAdmin():  # Check if the current user is an admin
            topicName = request.form["topicName"]
            postingUser = current_user.id
            creationTime = int(time.time())
            # Use the current time as the last visit time
            updateTime = creationTime
            # Connect to the database
            conn = sqlite3.connect('debate.sqlite')
            c = conn.cursor()
            c.execute("INSERT INTO topic (topicName, postingUser, creationTime, updateTime) VALUES (?, ?, ?, ?)",
                      (topicName, postingUser, creationTime, updateTime))
            conn.commit()
            conn.close()
            return "success"
        else:
            return "Only admins can add topics"
    else:
        return "Please log in to add a topic"

# Fetch topics route
@app.route("/fetch_topics")
def fetch_topics():
    conn = sqlite3.connect('debate.sqlite')
    c = conn.cursor()
    c.execute("SELECT topic.topicName, user.userName FROM topic JOIN user ON topic.postingUser = user.userID")
    topics = [{'topicName': row[0], 'postingUser': row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify({'topics': topics})

# Start app
if __name__ == "__main__":
    app.run(debug=True)
