from flask import Flask
from flask_cors import CORS
from routes.apiRoutes import api_blueprint

app = Flask(__name__)
CORS(app)
app.register_blueprint(api_blueprint, url_prefix='/handsUPApi')

if __name__ == '__main__':
    app.run(debug=True)
