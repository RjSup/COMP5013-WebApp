import os
import time
from flask import Flask, render_template, request, redirect, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import sqlite3
import hashlib
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

login_manager = LoginManager()
login_manager.init_app(app)

# Hash the user password
def hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, id):
        self.id = id

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

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

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

@app.route("/check-login")
def checkLogin():
    if current_user.is_authenticated:
        return jsonify({"logged_in": True})
    else:
        return jsonify({"logged_in": False})

if __name__ == "__main__":
    app.run(debug=True)
