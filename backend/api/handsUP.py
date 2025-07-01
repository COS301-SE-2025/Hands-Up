
# all web apps from other domains to access the acall this api
from flask import Flask
from flask_cors import CORS
from routes.apiRoutes import api_blueprint

app = Flask(__name__)
CORS(app)
app.register_blueprint(api_blueprint, url_prefix='/handsUPApi')
#it registers a blueprint from apiRoutes.py making hte API available at hansUPApi

if __name__ == '__main__':
    app.run(debug=True)
