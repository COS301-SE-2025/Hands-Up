from flask import Flask, Blueprint, request, jsonify
import requests
import os

app = Flask(__name__)

# Load a single environment variable for the base Hugging Face URL
HUGGINGFACE_BASE_URL = os.environ.get("HUGGINGFACE_BASE_URL")

api_blueprint = Blueprint('sign', __name__, url_prefix='/sign')

@api_blueprint.route('/sign/processImage', methods=['POST'])
def process_image():
    files = request.files.getlist('frames')
    sequenceNum = 20
    
    if len(files) != sequenceNum:
        return jsonify({'error': f'Exactly {sequenceNum} frames required'}), 400

    files_to_send = [('frames', (file.filename, file.stream.read(), file.content_type)) for file in files]
    
    # Construct the full URL by appending the endpoint
    url = f"{HUGGINGFACE_BASE_URL}/detect-letters"
    
    try:
        response = requests.post(url, files=files_to_send, timeout=300)
        response.raise_for_status()
        
        return jsonify(response.json())
        
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else 500
        return jsonify({
            'error': 'Failed to communicate with the AI model backend.',
            'details': str(e),
            'status_code': status_code
        }), status_code

@api_blueprint.route('/sign/processWords', methods=['POST'])
def process_words():
    files = request.files.getlist('frames')
    sequenceNum = 90
    
    if len(files) != sequenceNum:
        return jsonify({'error': f'Exactly {sequenceNum} frames required'}), 400

    files_to_send = [('frames', (file.filename, file.stream.read(), file.content_type)) for file in files]
    
    # Construct the full URL by appending the endpoint
    url = f"{HUGGINGFACE_BASE_URL}/detect-words"
    
    try:
        response = requests.post(url, files=files_to_send, timeout=300)
        response.raise_for_status()
        
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else 500
        return jsonify({
            'error': 'Failed to communicate with the AI model backend.',
            'details': str(e),
            'status_code': status_code
        }), status_code

app.register_blueprint(api_blueprint)

if __name__ == '__main__':
    app.run(debug=True)