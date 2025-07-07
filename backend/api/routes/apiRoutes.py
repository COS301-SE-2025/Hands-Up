from flask import Blueprint, request, jsonify
from controllers.lettersController import detectFromImage
from controllers.wordsController import detectFromFrames
import tempfile
import os

api_blueprint = Blueprint('sign', __name__, url_prefix='/sign')

@api_blueprint.route('/sign/processImage', methods=['POST'])
def process_image():
    files = request.files.getlist('frames')
    
    if len(files) != 15:
        return jsonify({'error': 'Exactly 15 frames required'}), 400

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
        # Clean up all files
        for path in paths:
            os.remove(path)
        os.rmdir(temp_dir)

@api_blueprint.route("/sign/processFrames", methods=["POST"])
def process_frames():
    files = request.files.getlist("frames")
    if not files:
        return jsonify({"error": "No frames provided"}), 400

    frames = []
    for file in sorted(files, key=lambda f: f.filename):  
        frames.append(file.read())

    try:
        result = detectFromFrames(frames)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

