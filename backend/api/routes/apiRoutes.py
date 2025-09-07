import requests
import os
from flask import Blueprint, request, jsonify

# Define the blueprint with the '/sign' URL prefix.
# This is the "middle block" of your URL.
api_blueprint = Blueprint('sign', __name__, url_prefix='/sign')

# Load the base Hugging Face URL from an environment variable
HUGGINGFACE_BASE_URL = os.environ.get("HUGGINGFACE_BASE_URL")

@api_blueprint.route('/sign/processImage', methods=['POST'])
def process_image():
    """
    Handles the image processing request for letters.
    Requires a POST request with exactly 20 frames.
    """
    print("Entered process_image endpoint")
    files = request.files.getlist('frames')
    sequenceNum = 20
    
    if len(files) != sequenceNum:
        return jsonify({'error': f'Exactly {sequenceNum} frames required'}), 400

    # This is the crucial part: format the files for the FastAPI endpoint
    # The key 'frames' must match the name in the FastAPI decorator.
    files_to_send = [('frames', (file.filename, file.stream.read(), file.content_type)) for file in files]
    
    url = f"{HUGGINGFACE_BASE_URL}/detect-letters"
    print(f"About to send data to Hugging Face model at {url}")
    
    try:
        response = requests.post(url, files=files_to_send, timeout=300)
        response.raise_for_status()
        
        return jsonify(response.json())
        
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else 500
        # Print the response text for detailed debugging!
        print("Received error from Hugging Face API:")
        if e.response is not None:
            print(e.response.text)
        else:
            print(f"No response object: {e}")
        
        return jsonify({
            'error': 'Failed to communicate with the AI model backend.',
            'details': str(e),
            'status_code': status_code
        }), status_code

@api_blueprint.route('/sign/processWords', methods=['POST'])
def process_words():
    """
    Handles the image processing request for words.
    Requires a POST request with exactly 90 frames.
    """
    print("Entered process_words endpoint")
    files = request.files.getlist('frames')
    sequenceNum = 90
    
    if len(files) != sequenceNum:
        return jsonify({'error': f'Exactly {sequenceNum} frames required'}), 400

    # This is the crucial part: format the files for the FastAPI endpoint
    # The key 'frames' must match the name in the FastAPI decorator.
    files_to_send = [('frames', (file.filename, file.stream.read(), file.content_type)) for file in files]
    
    url = f"{HUGGINGFACE_BASE_URL}/detect-words"
    print(f"About to send data to Hugging Face model at {url}")
    
    try:
        response = requests.post(url, files=files_to_send, timeout=300)
        response.raise_for_status()
        
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response is not None else 500
        # Print the response text for detailed debugging!
        print("Received error from Hugging Face API:")
        if e.response is not None:
            print(e.response.text)
        else:
            print(f"No response object: {e}")
        return jsonify({
            'error': 'Failed to communicate with the AI model backend.',
            'details': str(e),
            'status_code': status_code
        }), status_code
