from flask import Flask
from flask_cors import CORS
from routes.apiRoutes import api_blueprint

# Create the main Flask application instance
app = Flask(__name__)

# Apply CORS to allow requests from the specified origin.
CORS(app, origins="https://handsup.onrender.com", supports_credentials=True)

# Configure session cookies for cross-site requests.
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

# Register the blueprint with the first part of the URL prefix.
# This makes all blueprint routes start with /handsUPApi.
app.register_blueprint(api_blueprint, url_prefix='/handsUPApi')

# This line is crucial for debugging! It shows you the final, registered routes.
print("Registered routes:")
print(app.url_map)

if __name__ == '__main__':
    # Run the application in debug mode for development.
    app.run(debug=True)
