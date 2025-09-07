from flask import Flask
from flask_cors import CORS
from routes.apiRoutes import api_blueprint

app = Flask(__name__)
CORS(app, origins="https://handsup.onrender.com", supports_credentials=True)
app.register_blueprint(api_blueprint, url_prefix='/handsUPApi')
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True  


if __name__ == '__main__':
    app.run(debug=True)
