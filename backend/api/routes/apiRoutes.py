from flask import Blueprint, request, jsonify
from controllers.lettersController import detectFromImage
import tempfile
import os

api_blueprint = Blueprint('sign', __name__, url_prefix='/sign')

@api_blueprint.route("/process-sign", methods=["POST"])
def process_sign_request():
    """
    Handles both single-image fingerspelling and multi-frame words recognition.
    It determines the mode (fingerspelling/words) and sequence length from the request.
    """
    
    # Get the mode from form data. Default to 'words' if not specified.
    mode = request.form.get('mode', 'words')

    # Get the files from the request. This endpoint expects multiple frames.
    files = request.files.getlist("frames")

    # Set the required sequence length based on the mode
    if mode == 'fingerspelling':
        sequenceNum = 1
        # In fingerspelling mode, we only need a single frame, but the client might send more.
        # We will only process the last frame for detection, but we check if at least one file exists.
        if not files:
            return jsonify({"error": "Fingerspelling mode requires at least one image frame"}), 400
    else:  # 'words' mode
        sequenceNum = 90
        if len(files) != sequenceNum:
            return jsonify({"error": f"Words mode requires exactly 90 frames, but got {len(files)}"}), 400

    # Create a temporary directory to store the frames
    temp_dir = tempfile.mkdtemp()
    paths = []
    
    try:
        # Save each frame to the temporary directory
        for i, file in enumerate(files):
            # Use a consistent naming scheme for sorting
            path = os.path.join(temp_dir, f'frame_{i:04d}.jpg') 
            file.save(path)
            paths.append(path)
            
        print(f"Received {len(paths)} frames. Processing in '{mode}' mode...")
        
        # Pass the list of paths and the mode to the Python controller
        result = detectFromImage(paths, mode)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error during sign processing: {str(e)}")
        return jsonify({"error": str(e)}), 500
        
    finally:
        # Clean up all temporary files and the directory
        for path in paths:
            if os.path.exists(path):
                os.remove(path)
        if os.path.exists(temp_dir):
            os.rmdir(temp_dir)