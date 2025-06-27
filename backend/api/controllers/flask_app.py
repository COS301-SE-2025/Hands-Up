from flask import Flask, request, jsonify
from flask_cors import CORS # Required for CORS: pip install Flask-Cors
import os
import sys
import time
import uuid # For generating unique filenames for uploaded files
import cv2 # Used by Detection.py for video processing; ensure it's installed

# --- Path Setup ---
# This setup ensures that your Flask app can find and import Detection.py
# Assuming this flask_app.py is in 'Hands-Up/backend/'
# and Detection.py is in 'Hands-Up/ai_model/notebook/'
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DETECTION_SCRIPT_DIR = os.path.join(SCRIPT_DIR,'..','..', '..', 'ai_model2', 'models') # Adjust if your structure differs

# Add the directory containing Detection.py to the Python path
if DETECTION_SCRIPT_DIR not in sys.path:
    sys.path.append(DETECTION_SCRIPT_DIR)
    print(f"Added '{DETECTION_SCRIPT_DIR}' to sys.path for Detection.py import.")
else:
    print(f"'{DETECTION_SCRIPT_DIR}' already in sys.path.")

# Import functions from Detection.py
# Ensure that Detection.py does not have an active `if __name__ == '__main__':`
# block that would try to parse arguments or start a loop when imported.
try:
    from Detection import load_model_and_assets, process_image_and_predict, process_video_and_predict_realtime, MIN_CONFIDENCE_THRESHOLD
    # If SEQUENCE_LENGTH is needed here, import it too: from Detection import MIN_CONFIDENCE_THRESHOLD, SEQUENCE_LENGTH
    print("Successfully imported functions from Detection.py")
except ImportError as e:
    print(f"ERROR: Could not import from Detection.py. Check path and file: {e}")
    print(f"Current sys.path: {sys.path}")
    sys.exit(1) # Exit if essential imports fail

app = Flask(__name__)
CORS(app) # Enable CORS for all routes (important for development with different origins)

# --- Flask Configuration ---
# Temporary folder for Flask to save uploaded files before processing
UPLOAD_FOLDER = os.path.join(SCRIPT_DIR, 'flask_uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    print(f"Created upload directory: {UPLOAD_FOLDER}")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Set maximum content length for uploads (e.g., 50MB)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024 # 50 MB limit

# Allowed file extensions for security and validation
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'webm', 'mkv'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

# --- Load AI Model and Assets Once on App Startup ---
# This is the key benefit of using Flask. The heavy lifting of model loading
# happens only when the Flask server starts, not for every incoming request.
print("\n--- Flask app starting: Loading AI model and assets... ---")
load_model_and_assets()
print("--- AI model and assets loaded. Ready to serve predictions. ---\n")

# --- Flask Routes ---

@app.route('/health', methods=['GET'])
def health_check():
    """
    A simple health check endpoint to verify the Flask server is running.
    Node.js can hit this to ensure the AI service is available.
    """
    return jsonify({
        "status": "healthy",
        "timestamp": time.time(),
        "message": "AI service is up and running"
    })

@app.route('/process-image', methods=['POST'])
def process_image_route():
    """
    Endpoint for processing a single image file for sign detection.
    Expects a 'image' file in the form-data.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided", "success": False}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected image file", "success": False}), 400

    if not allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        return jsonify({"error": "Invalid image file type", "success": False}), 400

    # Extract min_confidence from form data, default to MIN_CONFIDENCE_THRESHOLD if not provided
    min_confidence = request.form.get('min_confidence', type=float, default=MIN_CONFIDENCE_THRESHOLD)
    
    # Generate a unique filename to avoid conflicts and save the uploaded file
    unique_filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

    try:
        file.save(filepath) # Save the incoming file temporarily
        print(f"Received and saved image: {filepath}")

        # Call the image processing function from Detection.py
        action, confidence = process_image_and_predict(filepath, min_confidence)

        # Prepare the response
        response = {
            "sign": action if action else "UNKNOWN", # Renamed from 'action' to 'sign' for images as per Node.js Controller
            "confidence": round(float(confidence), 2),
            "success": True,
            "filename": file.filename # Optional: for reference
        }
        return jsonify(response)

    except Exception as e:
        # Log the full traceback for debugging
        import traceback
        traceback.print_exc(file=sys.stderr)
        print(f"Error processing image {file.filename}: {e}", file=sys.stderr)
        return jsonify({
            "error": "Error processing image with AI model",
            "details": str(e),
            "success": False
        }), 500
    finally:
        # Ensure the temporary file is deleted even if an error occurs
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"Cleaned up temporary image file: {filepath}")

@app.route('/process-video', methods=['POST'])
def process_video_route():
    """
    Endpoint for processing a video file for sign/phrase detection.
    Expects a 'video' file in the form-data.
    """
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided", "success": False}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({"error": "No selected video file", "success": False}), 400

    if not allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS):
        return jsonify({"error": "Invalid video file type", "success": False}), 400

    # Extract min_confidence from form data, default to MIN_CONFIDENCE_THRESHOLD if not provided
    min_confidence = request.form.get('min_confidence', type=float, default=MIN_CONFIDENCE_THRESHOLD)

    # Generate a unique filename and save the uploaded file
    unique_filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

    try:
        file.save(filepath) # Save the incoming file temporarily
        print(f"Received and saved video: {filepath}")

        # Call the video processing function from Detection.py
        # This function should be optimized for real-time processing as discussed
        action, confidence = process_video_and_predict_realtime(filepath, min_confidence)

        # Prepare the response
        response = {
            "phrase": action if action else "UNKNOWN", # Renamed from 'action' to 'phrase' for videos as per Node.js Controller
            "confidence": round(float(confidence), 2),
            "success": True,
            "filename": file.filename # Optional: for reference
        }
        return jsonify(response)

    except Exception as e:
        # Log the full traceback for debugging
        import traceback
        traceback.print_exc(file=sys.stderr)
        print(f"Error processing video {file.filename}: {e}", file=sys.stderr)
        return jsonify({
            "error": "Error processing video with AI model",
            "details": str(e),
            "success": False
        }), 500
    finally:
        # Ensure the temporary file is deleted even if an error occurs
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"Cleaned up temporary video file: {filepath}")

if __name__ == '__main__':
    # When running directly, start the Flask development server.
    # Set debug=True for development to get auto-reloads and debugger.
    # Set debug=False for production.
    app.run(host='0.0.0.0', port=6000, debug=False)