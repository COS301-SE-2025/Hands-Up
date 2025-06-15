from flask import Blueprint, request, jsonify
from controllers.modelControllers import detect_from_video
import tempfile
import os

api_blueprint = Blueprint('/sign', __name__)

@api_blueprint.route('/sign/processImage', methods=['POST'])
def process_video():
    if 'image' not in request.files:
        return jsonify({'error': 'No video uploaded'}), 400

    video_file = request.files['image']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
        video_path = tmp.name
        video_file.save(video_path)

    result = detect_from_video(video_path)
    os.remove(video_path)

    return jsonify(result)
