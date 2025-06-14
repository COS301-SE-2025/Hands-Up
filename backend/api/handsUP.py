from flask import Flask
from routes.apiRoutes import api_blueprint

app = Flask(__name__)
app.register_blueprint(api_blueprint, url_prefix='/process-video')

if __name__ == '__main__':
    app.run(debug=True)