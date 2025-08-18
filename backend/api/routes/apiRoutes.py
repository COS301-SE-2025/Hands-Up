from flask import Blueprint, request, jsonify
from controllers.lettersController import detectFromImage
from controllers.wordsController import detectWords
import tempfile
import os

api_blueprint = Blueprint('sign', __name__, url_prefix='/sign')

#recieves an image, saves it temporarily, and passes its path to detect from image the deletes teh temp file 
@api_blueprint.route('/sign/processImage', methods=['POST'])
def process_image():
    files = request.files.getlist('frames')
    sequenceNum = 20
    
    if len(files) != sequenceNum:
        return jsonify({'error': 'Exactly 20 frames required'}), 400

    image_file = request.files['image']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
        image_path = tmp.name
        image_file.save(image_path)

    result = detectFromImage(image_path)
    os.remove(image_path)

    return jsonify(result)

@api_blueprint.route('/sign/processWord', methods=['POST'])
def process_word():
    files = request.files.getlist('frames')
    sequenceNum = 90
    
    if len(files) != sequenceNum:
        return jsonify({'error': 'Exactly 90 frames required'}), 400

    image_file = request.files['image']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
        image_path = tmp.name
        image_file.save(image_path)

    result = detectWords(image_path)
    os.remove(image_path)

    return jsonify(result)

