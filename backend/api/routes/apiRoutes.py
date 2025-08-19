from fastapi import APIRouter, UploadFile, File, HTTPException
from flask import Blueprint, request, jsonify
from controllers.lettersController import detectFromImage
import tempfile, os

api_blueprint = Blueprint('sign', __name__, url_prefix='/sign')

@api_blueprint.route('/sign/processImage', methods=['POST'])
def process_image():
    files = request.files.getlist('frames')
    
    sequenceNum = 20

    if len(files) != sequenceNum:
        raise HTTPException(status_code=400, detail="Exactly 20 frames required")

    image_file = request.files['image']

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
        image_path = tmp.name
        image_file.save(image_path)

    result = detectFromImage(image_path)
    os.remove(image_path)

    return jsonify(result)
