from flask import Blueprint, request, jsonify
from controller.asl_controller import detect_from_video
import tempfile
import os

api_blueprint = Blueprint('sign', __name__)

@api_blueprint.route('/process-video', methods=['POST'])
def process_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video uploaded'}), 400

    video_file = request.files['video']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
        video_path = tmp.name
        video_file.save(video_path)

    result = detect_from_video(video_path)
    os.remove(video_path)

    return jsonify({'phrase': result})
