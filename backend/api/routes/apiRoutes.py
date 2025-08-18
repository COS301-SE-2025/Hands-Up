from fastapi import APIRouter, UploadFile, File, HTTPException
from controllers.lettersController import detectFromImage
from controllers.wordsController import detectFromFrames
import tempfile
import os

api_blueprint = Blueprint('sign', __name__, url_prefix='/sign')

@api_blueprint.route('/sign/processImage', methods=['POST'])
def process_image():
    files = request.files.getlist('frames')
    
    sequenceNum = 20

    if len(frames) != sequenceNum:
        raise HTTPException(status_code=400, detail="Exactly 20 frames required")

    image_file = request.files['image']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
        image_path = tmp.name
        image_file.save(image_path)

    result = detectFromImage(image_path)
    os.remove(image_path)

    return jsonify(result)

@api_blueprint.route('/sign/processWord', methods=['POST'])
def process_image():
    files = request.files.getlist('frames')
    sequenceNum = 20
    
    if len(files) != sequenceNum:
        return jsonify({'error': 'Exactly 90 frames required'}), 400

    image_file = request.files['image']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
        image_path = tmp.name
        image_file.save(image_path)

    result = detectFromImage(image_path)
    os.remove(image_path)

    return jsonify(result)

#recieves multiple frames reads them in order and pasesses them to detectFromFrames
@api_blueprint.route("/sign/processFrames", methods=["POST"])
def process_frames():
    files = request.files.getlist("frames")
    if not files:
        return jsonify({"error": "No frames provided"}), 400

    frames = []
    for file in sorted(files, key=lambda f: f.filename):  
        frames.append(file.read())

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

# @api_blueprint.route("/sign/processFrames", methods=["POST"])
# def process_frames():
#     files = request.files.getlist("frames")
#     if not files:
#         return jsonify({"error": "No frames provided"}), 400

#     frames = []
#     for file in sorted(files, key=lambda f: f.filename):  
#         frames.append(file.read())

#     try:
#         result = detectFromFrames(frames)
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

