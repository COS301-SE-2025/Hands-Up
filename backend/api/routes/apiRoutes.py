from flask import Blueprint, request, jsonify
from controllers.modelControllers import detect_from_video, detect_from_image
import tempfile
import os

api_blueprint = Blueprint('/sign', __name__)

@api_blueprint.route('/sign/processImage', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image_file = request.files['image']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
        image_path = tmp.name
        image_file.save(image_path)

    result = detect_from_image(image_path)
    os.remove(image_path)

    return jsonify(result)

@api_blueprint.route('/sign/processVideo', methods=['POST'])
def process_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video uploaded'}), 400

    video_file = request.files['video']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
        video_path = tmp.name
        video_file.save(video_path)

    result = detect_from_video(video_path)
    os.remove(video_path)

    return jsonify(result)