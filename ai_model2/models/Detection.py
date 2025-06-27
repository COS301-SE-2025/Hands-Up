import cv2
import json
import os
import argparse
import numpy as np
import mediapipe as mp
import pickle
from tensorflow.keras.models import load_model
import time # Import for timing operations

# Mediapipe setup
# Optimize Mediapipe for performance:
# - STATIC_IMAGE_MODE=False for video streams
# - model_complexity=1 for a balance of accuracy and speed
mp_holistic = mp.solutions.holistic

# --- Configuration Constants ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Update paths to be absolute (already done, good!)
MODEL_PATH = os.path.join(SCRIPT_DIR, 'action_model.h5')
NORMALIZATION_PARAMS_PATH = os.path.join(SCRIPT_DIR, 'normalization_params.npy')
LABEL_MAP_PATH = os.path.join(SCRIPT_DIR, 'label_map.pkl')
SEQUENCE_LENGTH = 30 # Must match what the model expects
# Define a history length for predictions to smooth results
PREDICTION_HISTORY_LENGTH = 5 # Number of recent predictions to consider for smoothing
MIN_CONFIDENCE_THRESHOLD = 0.7 # Default minimum confidence to report a sign/phrase

# --- Global variables for model and normalization ---
model = None
X_mean, X_std = 0, 1 # Fallback defaults
actions = [] # List of action names
label_map = {} # Maps action name to integer label
reversed_label_map = {} # Maps integer label back to action name

def load_model_and_assets():
    """Load the model, normalization parameters, and label map"""
    global model, X_mean, X_std, actions, label_map, reversed_label_map
    
    # Try to enable GPU for TensorFlow if available
    try:
        import tensorflow as tf
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            try:
                # Currently, a common strategy is to allow growth for memory to prevent allocating all GPU memory at once
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
                print(f"TensorFlow is configured to use GPU: {gpus}")
            except RuntimeError as e:
                print(f"Error setting GPU memory growth: {e}")
        else:
            print("No GPU found for TensorFlow, using CPU.")
    except Exception as e:
        print(f"Could not configure TensorFlow for GPU: {e}")


    try:
        model = load_model(MODEL_PATH)
        print(f"Model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model from {MODEL_PATH}: {e}")
        model = None

    try:
        X_mean, X_std = np.load(NORMALIZATION_PARAMS_PATH)
        print(f"Normalization parameters loaded from {NORMALIZATION_PARAMS_PATH}")
    except Exception as e:
        print(f"Error loading normalization parameters: {e}")
        X_mean, X_std = 0, 1

    try:
        with open(LABEL_MAP_PATH, 'rb') as f:
            label_map = pickle.load(f)
        actions = sorted(list(label_map.keys()))
        reversed_label_map = {v: k for k, v in label_map.items()}
        print(f"Label map loaded with {len(actions)} actions")
    except Exception as e:
        print(f"Error loading label map: {e}")
        actions = []
        reversed_label_map = {}

def extract_keypoints(results):
    """Extract keypoints from Mediapipe Holistic results"""
    # Using ternary operator for more concise extraction
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() \
            if results.pose_landmarks else np.zeros(33*4)
    
    # Only use face landmarks if they are actually used by your model.
    # If your model doesn't use face keypoints, setting this to zeros(0)
    # or excluding it entirely will save computation.
    # For now, keep it as is, but be mindful of its size (468*3 = 1404 features)
    face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten() \
            if results.face_landmarks else np.zeros(468*3) # Consider reducing face keypoints or removing if not critical

    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() \
            if results.left_hand_landmarks else np.zeros(21*3)
    
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() \
            if results.right_hand_landmarks else np.zeros(21*3)
    
    return np.concatenate([pose, face, lh, rh])

def predict_sequence(keypoint_sequence, min_confidence=MIN_CONFIDENCE_THRESHOLD):
    """Predict action from a sequence of keypoints"""
    if model is None or not actions:
        # print("Model or label map not loaded - cannot predict") # Keep this silent for real-time
        return None, 0.0
    
    # Add batch dimension and normalize
    # Ensure the input shape matches what your model expects
    # If your model expects (None, SEQUENCE_LENGTH, num_features), ensure keypoint_sequence is (SEQUENCE_LENGTH, num_features)
    input_data = np.expand_dims(keypoint_sequence, axis=0)
    input_data_norm = (input_data - X_mean) / (X_std + 1e-8)
    
    # Make prediction
    predictions = model.predict(input_data_norm, verbose=0)[0]
    predicted_idx = np.argmax(predictions)
    confidence = float(predictions[predicted_idx])

    if confidence >= min_confidence:
        predicted_action = reversed_label_map.get(predicted_idx, "UNKNOWN")
        return predicted_action, confidence
    else:
        return None, confidence # Return None if confidence is too low

def process_image_and_predict(image_path, min_confidence=MIN_CONFIDENCE_THRESHOLD):
    """Process a single image file and predict the action"""
    if model is None:
        print("Model not loaded - cannot predict")
        return None, 0.0

    if not os.path.exists(image_path):
        print(f"Image file not found: {image_path}")
        return None, 0.0

    try:
        frame = cv2.imread(image_path)
        if frame is None:
            print(f"Could not read image: {image_path}")
            return None, 0.0

        with mp_holistic.Holistic(static_image_mode=True, model_complexity=1) as holistic:
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = holistic.process(image)

            if results.pose_landmarks or results.face_landmarks or results.left_hand_landmarks or results.right_hand_landmarks:
                keypoints = extract_keypoints(results)
                # For single image, you typically have one frame. Your model expects a sequence.
                # You might need to adapt the model for single-frame prediction or
                # create a dummy sequence (e.g., repeating the single frame SEQUENCE_LENGTH times).
                # Assuming your model expects (1, SEQUENCE_LENGTH, num_features) and your model
                # was trained with sequences, repeating the frame is a common workaround for single images.
                # A better approach would be to train a separate single-frame model or ensure
                # the existing model can handle a sequence of 1.
                # For now, let's repeat the frame to fit the SEQUENCE_LENGTH expectation.
                
                # Check if keypoints is not empty, it could be empty if no landmarks detected.
                if keypoints.size > 0:
                    repeated_sequence = np.array([keypoints] * SEQUENCE_LENGTH)
                    action, confidence = predict_sequence(repeated_sequence, min_confidence)
                    return action, confidence
                else:
                    return None, 0.0
            else:
                return None, 0.0

    except Exception as e:
        print(f"Error processing image {image_path}: {e}")
        return None, 0.0


def process_video_and_predict_realtime(video_path, min_confidence=MIN_CONFIDENCE_THRESHOLD):
    """
    Process a video file in a more real-time manner.
    This version collects a sliding window of frames and predicts.
    """
    if model is None:
        print("Model not loaded - cannot predict")
        return None, 0.0
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return None, 0.0

    # Initialize a deque (double-ended queue) for efficient sequence handling
    # collections.deque is more efficient than list.append + list.pop(0)
    from collections import deque
    sequence_buffer = deque(maxlen=SEQUENCE_LENGTH)
    
    # Store recent predictions for smoothing/majority voting
    prediction_history = deque(maxlen=PREDICTION_HISTORY_LENGTH)

    predicted_action = "N/A"
    current_confidence = 0.0
    
    # Use Holistic for video streams (min_detection_confidence=0.5, min_tracking_confidence=0.5)
    # model_complexity=1 for speed.
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5, model_complexity=1) as holistic:
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            # Optional: Resize frame if it's very high resolution, to speed up Mediapipe
            # if frame.shape[0] > 720: # Example: if height > 720p
            #    frame = cv2.resize(frame, (int(frame.shape[1] * (720 / frame.shape[0])), 720))

            # Process frame with Mediapipe
            # Make image not writeable to pass by reference to Mediapipe for performance
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = holistic.process(image)
            image.flags.writeable = True # Make it writeable again if you want to draw on it later

            # Extract keypoints
            keypoints = extract_keypoints(results)
            
            # Append to buffer
            sequence_buffer.append(keypoints)
            
            # Only predict once the buffer is full
            if len(sequence_buffer) == SEQUENCE_LENGTH:
                sequence_np = np.array(list(sequence_buffer)) # Convert deque to numpy array
                action, confidence = predict_sequence(sequence_np, min_confidence)
                
                # Smooth predictions (e.g., majority vote or average confidence)
                if action:
                    prediction_history.append((action, confidence))
                else:
                    prediction_history.append(("N/A", confidence)) # Store N/A for low confidence

                # Simple smoothing: Take the most frequent action with high enough confidence
                if len(prediction_history) > 0:
                    # Filter out "N/A" and predictions below min_confidence for majority vote
                    valid_predictions = [p[0] for p in prediction_history if p[0] != "N/A" and p[1] >= min_confidence]
                    if valid_predictions:
                        from collections import Counter
                        most_common_action = Counter(valid_predictions).most_common(1)
                        if most_common_action:
                            predicted_action = most_common_action[0][0]
                            # You might want to average confidence for the most common action
                            # For simplicity, we'll just report the confidence of the last prediction if it was valid
                            current_confidence = confidence 
                        else:
                            predicted_action = "N/A"
                            current_confidence = 0.0 # Or the highest confidence among filtered out ones
                    else:
                        predicted_action = "N/A"
                        current_confidence = 0.0 # Or the highest confidence among filtered out ones
                
                # If you want real-time output per frame, print here
                # print(f"Frame {frame_count}: Predicted {predicted_action} (Conf: {current_confidence:.2f})")
                
                # In a real-time application, you might display this on the frame or send it via a socket.
                # For this script, we'll just take the final prediction after the video ends.
                
    cap.release()
    
    # Final prediction after processing the video
    # If the video was too short to fill the buffer, handle that
    if len(sequence_buffer) < SEQUENCE_LENGTH:
        print(f"Warning: Video was shorter than SEQUENCE_LENGTH ({len(sequence_buffer)} frames vs {SEQUENCE_LENGTH}). No prediction made based on full sequence.")
        return None, 0.0 # Or attempt prediction with partial sequence if your model supports it

    return predicted_action, current_confidence


if __name__ == '__main__':
    # Load model and assets first (only once when script starts)
    load_model_and_assets()
    
    parser = argparse.ArgumentParser(description="Run sign language detection on an image or video.")
    parser.add_argument("--video", type=str, help="Path to the input video file")
    parser.add_argument("--image", type=str, help="Path to the input image file")
    parser.add_argument("--min_confidence", type=float, default=MIN_CONFIDENCE_THRESHOLD, 
                        help=f"Minimum confidence threshold for a prediction to be reported (default: {MIN_CONFIDENCE_THRESHOLD})")
    
    args = parser.parse_args()
    
    final_action = None
    final_confidence = 0.0
    
    start_time = time.time()

    if args.image:
        image_path = args.image
        if os.path.exists(image_path):
            final_action, final_confidence = process_image_and_predict(image_path, args.min_confidence)
            result_type = "image"
        else:
            final_action = None
            final_confidence = 0.0
            error_message = f"Image file not found: {image_path}"
            result_type = "image_error"
            print(json.dumps({
                "success": False,
                "error": error_message,
                "sign": None,
                "confidence": 0.0,
                "image_path": image_path
            }))
            exit() # Exit if image not found
    elif args.video:
        video_path = args.video
        if os.path.exists(video_path):
            final_action, final_confidence = process_video_and_predict_realtime(video_path, args.min_confidence)
            result_type = "video"
        else:
            final_action = None
            final_confidence = 0.0
            error_message = f"Video file not found: {video_path}"
            result_type = "video_error"
            print(json.dumps({
                "success": False,
                "error": error_message,
                "phrase": None,
                "confidence": 0.0,
                "video_path": video_path
            }))
            exit() # Exit if video not found
    else:
        # No image or video argument provided
        print(json.dumps({
            "success": False,
            "error": "No input image or video file specified. Use --image or --video.",
            "sign": None,
            "phrase": None,
            "confidence": 0.0
        }))
        exit() # Exit if no input

    end_time = time.time()
    processing_time = end_time - start_time
    # print(f"Total processing time: {processing_time:.2f} seconds") # For debugging

    # Structure the response as JSON (based on the API expectations)
    if result_type == "image":
        result = {
            "success": True,
            "error": None,
            "sign": final_action if final_action else "UNKNOWN",
            "confidence": round(float(final_confidence), 2),
            "image_path": args.image,
            "processing_time_sec": round(processing_time, 2)
        }
    elif result_type == "video":
        result = {
            "success": True,
            "error": None,
            "phrase": final_action if final_action else "UNKNOWN",
            "confidence": round(float(final_confidence), 2),
            "video_path": args.video,
            "processing_time_sec": round(processing_time, 2)
        }
    else: # Error case, should have exited earlier but as fallback
        result = {
            "success": False,
            "error": "An unexpected error occurred or input not handled.",
            "phrase": None,
            "confidence": 0.0
        }

    # Print JSON (Node.js will capture this as stdout)
    print(json.dumps(result))