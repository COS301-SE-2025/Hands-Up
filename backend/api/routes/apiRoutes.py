from flask import Blueprint, request, jsonify
from controllers.lettersController import detectFromImage
from controllers.wordsController import detectFromFrames
import tempfile
import os

api_blueprint = Blueprint('sign', __name__, url_prefix='/sign')

@api_blueprint.route('/sign/processImage', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image_file = request.files['image']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
        image_path = tmp.name
        image_file.save(image_path)

    result = detectFromImage(image_path)
    os.remove(image_path)

    return jsonify(result)

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

