import unittest
# import app modules
from app import app, connectDB, addUser, authUser, isAdmin, hash, login_user, logout_user

# create a test class
class TestApp(unittest.TestCase):
    def setUp(self):
        # Create a test client
        self.app = app.test_client()
        self.app.testing = True
        
        # To test data against my database
        conn = connectDB()
        c = conn.cursor()
        
        # Create a mock table
        c.execute("""
            CREATE TABLE user (
                userID INTEGER PRIMARY KEY AUTOINCREMENT,
                userName TEXT NOT NULL UNIQUE,
                passwordHash TEXT NOT NULL,
                isAdmin BOOLEAN NOT NULL,
                creationTime INTEGER NOT NULL,
                lastVisit INTEGER NOT NULL
            )
        """)

        # Commit the changes and close the connection
        conn.commit()
        conn.close()
        
        
    # to close the connection to the database
    def tearDown(self):
        conn = connectDB()
        c = conn.cursor()
        
        # delete he mock table
        c.execute("DROP TABLE IF EXISTS user")
        
        conn.commit()
        conn.close()
        
    
    # test the connectDB function
    def test_connectDB(self):
        result = connectDB()
        self.assertIsNotNone(result)
        
    
    # test the addUser function
    def test_home(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Welcome to Conversely', response.data)
        
        
    # test the addUser function
    def test_addUser(self):
        addUser('test', 'test', False)
        result = authUser('test', 'test')
        self.assertIsNotNone(result)
        

    # test the authUser function
    def test_authUser(self):
         result = authUser('test', 'test')
         self.assertIsNone(result)
         

    # test the isAdmin function
    def test_isAdmin(self):
        addUser('testAdmin', 'testAdmin', True)
        
        # test if user is admin
        with app.test_request_context():
            user = authUser('testAdmin', 'testAdmin')
            login_user(user)
            result = isAdmin()
            self.assertTrue(result)
            logout_user()
            
            result = isAdmin()
            self.assertFalse(result)
            
    
    # test the hash function
    def test_hash(self):
        result = hash('test')
        self.assertIsNotNone(result)
        
    
    # test the add_admin route
    def tearDown(self):
    # Connect to the database
        conn = connectDB()
        c = conn.cursor()

        # Delete the tables
        c.execute("DROP TABLE IF EXISTS user")

        # Commit the changes and close the connection
        conn.commit()
        conn.close()
    

if __name__ == '__main__':
    unittest.main()
