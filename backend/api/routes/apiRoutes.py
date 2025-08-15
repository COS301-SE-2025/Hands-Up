from flask import Blueprint, request, jsonify
import requests
import os

# Define your Hugging Face Space URL here
HUGGINGFACE_API_URL = os.environ.get("HUGGINGFACE_LETTER_MODEL_API")

api_blueprint = Blueprint('sign', __name__, url_prefix='/sign')

@api_blueprint.route('/sign/processImage', methods=['POST'])
def process_image():
    files = request.files.getlist('frames')
    
    if not HUGGINGFACE_API_URL:
        return jsonify({'error': 'Hugging Face API URL not configured'}), 500

    if len(files) != 20:
        return jsonify({'error': 'Exactly 20 frames required'}), 400

    # Prepare files for the request
    file_payload = [('frames', (file.filename, file.stream, file.content_type)) for file in files]
    
    try:
        # Forward the request to the Hugging Face API
        response = requests.post(f"{HUGGINGFACE_API_URL}/detect-letters-from-sequence", files=file_payload)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
        
        return jsonify(response.json())
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Failed to connect to AI model API', 'details': str(e)}), 500