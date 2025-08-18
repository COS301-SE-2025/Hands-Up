from flask import Blueprint, request, jsonify
from controllers.lettersController import detectFromImage
from controllers.wordsController import detectWords
import tempfile
import os

api_blueprint = Blueprint('sign', __name__, url_prefix='/sign')

@api_blueprint.route('/sign/processImage', methods=['POST'])
def process_image():
    files = request.files.getlist('frames')
    sequenceNum = 20
    
    if len(files) != sequenceNum:
        return jsonify({'error': 'Exactly 20 frames required'}), 400

    temp_dir = tempfile.mkdtemp()
    paths = []

    try:
        for i, file in enumerate(files):
            path = os.path.join(temp_dir, f'frame_{i}.jpg')
            file.save(path)
            paths.append(path)

        result = detectFromImage(paths)
        return jsonify(result)
    finally:
        for path in paths:
            os.remove(path)
        os.rmdir(temp_dir)

@api_blueprint.route('/sign/processWords', methods=['POST'])
def process_words():
    files = request.files.getlist('frames')
    sequenceNum = 90
    
    if len(files) != sequenceNum:
        return jsonify({'error': 'Exactly 90 frames required'}), 400

    temp_dir = tempfile.mkdtemp()
    paths = []

    try:
        for i, file in enumerate(files):
            path = os.path.join(temp_dir, f'frame_{i}.jpg')
            file.save(path)
            paths.append(path)

        result = detectWords(paths)
        return jsonify(result)
    finally:
        # Clean up all files
        for path in paths:
            os.remove(path)
        os.rmdir(temp_dir)


