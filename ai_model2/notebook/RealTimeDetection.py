import cv2
import json # Not strictly used now, but kept if needed for future config loading
import os
import argparse
import numpy as np
import mediapipe as mp
import pickle
from tensorflow.keras.models import load_model
import time # Import for timing operations
from collections import deque # For efficient sequence and history management
from collections import Counter # For majority voting

# Mediapipe setup
mp_holistic = mp.solutions.holistic # Using default model_complexity=1 for holistic by default in video mode

# --- Configuration Constants ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Paths to model assets (relative to script directory)
# Ensure these paths correctly point to your saved model files.
# If your 'models' folder is one level up from your script, adjust accordingly.
# Example: If script is in 'my_project/src' and models are in 'my_project/models', use '../models/...'
MODEL_PATH = os.path.join(SCRIPT_DIR, '..', 'models', 'action_model.h5')
NORMALIZATION_PARAMS_PATH = os.path.join(SCRIPT_DIR, '..', 'models', 'normalization_params.npy')
LABEL_MAP_PATH = os.path.join(SCRIPT_DIR, '..', 'models', 'label_map.pkl')

SEQUENCE_LENGTH = 30 # Number of frames needed for prediction (must match model training)
PREDICTION_HISTORY_LENGTH = 10 # Number of recent predictions to consider for smoothing (increased for more stability)
MIN_CONFIDENCE_THRESHOLD = 0.7 # Minimum confidence to report a sign/phrase
STRIDE_FRAMES = 5 # Number of frames to advance the sequence buffer before a new prediction.
                  # Lower value = more frequent predictions, potentially smoother but more CPU.
                  # Higher value = less frequent, potentially more responsive to new signs.

# --- Global variables for model and normalization ---
model = None
X_mean, X_std = 0, 1 # Fallback defaults if loading fails
actions = [] # List of action names
label_map = {} # Maps action name to integer label
reversed_label_map = {} # Maps integer label back to action name

# --- Drawing Utilities (Re-defined for clarity, or import from a separate file) ---
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles # For better drawing styles

def load_model_and_assets():
    """Load the model, normalization parameters, and label map."""
    global model, X_mean, X_std, actions, label_map, reversed_label_map

    # Try to enable GPU for TensorFlow if available
    try:
        import tensorflow as tf
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            try:
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
        # It's crucial to exit or handle this gracefully in a real-time app
        # If the model can't be loaded, the app can't function.
        raise RuntimeError(f"Failed to load model. Please ensure '{MODEL_PATH}' exists and is valid.")

    try:
        # Load normalization parameters. Add 1e-8 to std when loading to match
        # how it's used in prediction to avoid division by zero if std was saved as 0.
        loaded_params = np.load(NORMALIZATION_PARAMS_PATH)
        X_mean, X_std = loaded_params[0], loaded_params[1]
        # Ensure std is never exactly zero for division
        X_std = np.where(X_std == 0, 1e-8, X_std) # Replace 0 with epsilon if encountered
        print(f"Normalization parameters loaded from {NORMALIZATION_PARAMS_PATH}")
    except Exception as e:
        print(f"Error loading normalization parameters: {e}")
        print("WARNING: Using default normalization parameters (mean=0, std=1). Predictions may be inaccurate.")
        X_mean, X_std = 0, 1 # Keep defaults, but warn that normalization might be off

    try:
        with open(LABEL_MAP_PATH, 'rb') as f:
            label_map = pickle.load(f)
        # Sort actions by their integer label for consistency in display
        actions = sorted(list(label_map.keys()), key=lambda x: label_map[x])
        reversed_label_map = {v: k for k, v in label_map.items()}
        print(f"Label map loaded with {len(actions)} actions: {', '.join(actions)}")
    except Exception as e:
        print(f"Error loading label map: {e}")
        actions = []
        reversed_label_map = {}
        raise RuntimeError(f"Failed to load label map. Please ensure '{LABEL_MAP_PATH}' exists and is valid.")

def extract_keypoints(results):
    """Extract keypoints from Mediapipe Holistic results."""
    # Ensure consistent output shape even if no landmarks are detected.
    # Use np.zeros_like or fixed size arrays
    pose_size = 33 * 4 # (x, y, z, visibility)
    face_size = 468 * 3 # (x, y, z)
    hand_size = 21 * 3 # (x, y, z)

    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() \
             if results.pose_landmarks else np.zeros(pose_size)

    face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten() \
             if results.face_landmarks else np.zeros(face_size)

    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() \
           if results.left_hand_landmarks else np.zeros(hand_size)

    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() \
           if results.right_hand_landmarks else np.zeros(hand_size)

    return np.concatenate([pose, face, lh, rh])

def predict_sequence(keypoint_sequence, min_confidence=MIN_CONFIDENCE_THRESHOLD):
    """Predict action from a sequence of keypoints."""
    if model is None or not actions:
        # print("Model not loaded or actions not defined. Cannot predict.") # Debug print
        return None, 0.0

    # Ensure the input shape matches what your model expects (1, SEQUENCE_LENGTH, num_features)
    # The `extract_keypoints` function should return a fixed number of features for each frame.
    # Check this with: print(keypoint_sequence.shape)
    if keypoint_sequence.shape[0] != SEQUENCE_LENGTH:
        # This shouldn't happen if the buffer is managed correctly, but as a safeguard:
        print(f"Warning: Sequence length mismatch. Expected {SEQUENCE_LENGTH}, got {keypoint_sequence.shape[0]}. Skipping prediction.")
        return None, 0.0

    input_data = np.expand_dims(keypoint_sequence, axis=0) # Add batch dimension
    input_data_norm = (input_data - X_mean) / X_std # X_std already adjusted for 1e-8 in load_model_and_assets

    # Make prediction
    predictions = model.predict(input_data_norm, verbose=0)[0] # Get probabilities for the single sample
    predicted_idx = np.argmax(predictions)
    confidence = float(predictions[predicted_idx])

    # For debugging purposes: print all probabilities for the current frame
    # print(f"Raw Predictions: {[f'{reversed_label_map.get(i, 'UNK')}: {p:.2f}' for i, p in enumerate(predictions)]}")

    if confidence >= min_confidence:
        predicted_action = reversed_label_map.get(predicted_idx, "UNKNOWN")
        return predicted_action, confidence
    else:
        # Return None if confidence is too low to signify "no strong prediction"
        return None, confidence

def draw_info_on_frame(image, current_sign, confidence, sentence_display):
    """Draws predicted sign, confidence, and sentence on the frame."""
    # Display current sign and confidence
    cv2.rectangle(image, (0,0), (image.shape[1], 60), (245, 117, 16), -1) # Background for sign info
    cv2.putText(image, f'Current Sign: {current_sign} ({confidence:.2f})', (3,30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)

    # Display accumulated sentence below
    cv2.putText(image, 'Sentence: ' + ' '.join(sentence_display), (3, 90), # Adjusted Y position for sentence
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2, cv2.LINE_AA)

def main_realtime_webcam(camera_index=0, min_confidence=MIN_CONFIDENCE_THRESHOLD):
    """
    Main function for real-time sign language detection using webcam.
    """
    try:
        load_model_and_assets() # Load assets once at the start
    except RuntimeError as e:
        print(f"Initialization failed: {e}")
        return

    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print(f"Error: Could not open webcam with index {camera_index}.")
        print("Please check if your webcam is connected and not in use by another application.")
        return

    # Initialize a deque (double-ended queue) for efficient sequence handling
    sequence_buffer = deque(maxlen=SEQUENCE_LENGTH)

    # Store recent *valid* predictions for smoothing (e.g., majority vote)
    prediction_history = deque(maxlen=PREDICTION_HISTORY_LENGTH)

    # Display variables
    current_predicted_sign = "N/A"
    current_predicted_confidence = 0.0
    # Sentence display: only add a word if it's different from the last one
    sentence_display = deque(maxlen=5) # Display up to 5 recent unique words
    last_added_to_sentence = None # Track last word added to prevent repetition

    # Frame counter for stride logic
    frame_counter = 0

    print("\nStarting webcam feed. Press 'q' to quit.")
    print("\nIMPORTANT: If you see frequent incorrect predictions (e.g., 'sleep' when idle),")
    print("           consider adding an 'idle' or 'no_action' class to your training data.")

    # Holistic model for video streaming
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame, exiting...")
                break

            # Flip frame horizontally for a mirror effect (common for webcam)
            frame = cv2.flip(frame, 1)

            # Convert BGR to RGB for Mediapipe
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False # Make image non-writeable to improve performance
            results = holistic.process(image)
            image.flags.writeable = True # Make image writeable again for drawing
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR) # Convert back to BGR for OpenCV display

            # Draw landmarks on the frame
            mp_drawing.draw_landmarks(image, results.face_landmarks, mp_holistic.FACEMESH_CONTOURS,
                                     landmark_drawing_spec=None,
                                     connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_contours_style())
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS,
                                     landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())
            mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
                                     landmark_drawing_spec=mp_drawing_styles.get_default_hand_landmarks_style())
            mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
                                     landmark_drawing_spec=mp_drawing_styles.get_default_hand_landmarks_style())

            # Extract keypoints and add to buffer
            keypoints = extract_keypoints(results)
            sequence_buffer.append(keypoints)
            frame_counter += 1

            # Predict when the buffer is full and a stride has passed
            if len(sequence_buffer) == SEQUENCE_LENGTH and frame_counter % STRIDE_FRAMES == 0:
                # Convert deque to numpy array for model input
                sequence_np = np.array(list(sequence_buffer))
                
                # Make prediction
                action, confidence = predict_sequence(sequence_np, min_confidence)
                
                # Add to prediction history (even if action is None, for history management)
                prediction_history.append((action, confidence))

                # --- Smoothing/Majority Voting Logic ---
                # Filter out None actions (low confidence) from history for majority vote
                valid_history_predictions = [p[0] for p in prediction_history if p[0] is not None]

                if valid_history_predictions:
                    most_common_prediction, count = Counter(valid_history_predictions).most_common(1)[0]
                    
                    # Calculate average confidence for the most common prediction
                    confidences_for_most_common = [p[1] for p in prediction_history if p[0] == most_common_prediction]
                    avg_confidence = np.mean(confidences_for_most_common) if confidences_for_most_common else 0.0

                    # Only update if the average confidence meets the threshold
                    if avg_confidence >= min_confidence:
                        current_predicted_sign = most_common_prediction
                        current_predicted_confidence = avg_confidence
                        
                        # Update sentence display (add only if different from last word)
                        if last_added_to_sentence != current_predicted_sign:
                            sentence_display.append(current_predicted_sign)
                            last_added_to_sentence = current_predicted_sign
                    else:
                        current_predicted_sign = "N/A"
                        current_predicted_confidence = 0.0
                else:
                    current_predicted_sign = "N/A"
                    current_predicted_confidence = 0.0
                
            # Draw current prediction and sentence on the frame
            draw_info_on_frame(image, current_predicted_sign, current_predicted_confidence, sentence_display)

            # Display the frame
            cv2.imshow('Real-time Sign Language Recognition', image)

            # Check for 'q' key press to exit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    # Release resources
    cap.release()
    cv2.destroyAllWindows()
    print("\nWebcam feed stopped.")

if __name__ == '__main__':
    # Parse command line arguments for flexibility (e.g., changing confidence)
    parser = argparse.ArgumentParser(description="Run real-time sign language detection using webcam.")
    parser.add_argument("--camera_index", type=int, default=0,
                        help="Index of the webcam to use (default: 0, typically built-in webcam)")
    parser.add_argument("--min_confidence", type=float, default=MIN_CONFIDENCE_THRESHOLD,
                        help=f"Minimum confidence threshold for a prediction to be reported (default: {MIN_CONFIDENCE_THRESHOLD})")
    parser.add_argument("--sequence_length", type=int, default=SEQUENCE_LENGTH,
                        help=f"Number of frames required for a sequence prediction (default: {SEQUENCE_LENGTH}). MUST match training.")
    parser.add_argument("--prediction_history_length", type=int, default=PREDICTION_HISTORY_LENGTH,
                        help=f"Number of recent predictions to consider for smoothing (default: {PREDICTION_HISTORY_LENGTH}).")
    parser.add_argument("--stride_frames", type=int, default=STRIDE_FRAMES,
                        help=f"Number of frames to advance the buffer for a new prediction (default: {STRIDE_FRAMES}).")

    args = parser.parse_args()

    # Update global constants based on command-line arguments
    SEQUENCE_LENGTH = args.sequence_length
    MIN_CONFIDENCE_THRESHOLD = args.min_confidence
    PREDICTION_HISTORY_LENGTH = args.prediction_history_length
    STRIDE_FRAMES = args.stride_frames


    # Call the real-time webcam function
    try:
        main_realtime_webcam(args.camera_index, args.min_confidence)
    except RuntimeError as e:
        print(f"Application error: {e}")
        print("Please ensure your model, normalization parameters, and label map files are correctly set up and accessible.")