import cv2
import json
import os
import argparse
import numpy as np
import mediapipe as mp
import pickle
from tensorflow.keras.models import load_model

# Mediapipe setup
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# --- Configuration Constants ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Update paths to be absolute
MODEL_PATH = os.path.join(SCRIPT_DIR, 'action_model.h5')
NORMALIZATION_PARAMS_PATH = os.path.join(SCRIPT_DIR, 'normalization_params.npy')
LABEL_MAP_PATH = os.path.join(SCRIPT_DIR, 'label_map.pkl')
SEQUENCE_LENGTH = 30  # Must match what the model expects

# --- Global variables for model and normalization ---
model = None
X_mean, X_std = 0, 1  # Fallback defaults
actions = []  # List of action names
label_map = {}  # Maps action name to integer label
reversed_label_map = {}  # Maps integer label back to action name

def load_model_and_assets():
    """Load the model, normalization parameters, and label map"""
    global model, X_mean, X_std, actions, label_map, reversed_label_map
    
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
    # Extract pose keypoints (flattened)
    pose = np.array([[res.x, res.y, res.z, res.visibility] 
                    for res in results.pose_landmarks.landmark]).flatten() \
                    if results.pose_landmarks else np.zeros(33*4)
    
    # Extract face keypoints (flattened)
    face = np.array([[res.x, res.y, res.z] 
                    for res in results.face_landmarks.landmark]).flatten() \
                    if results.face_landmarks else np.zeros(468*3)
    
    # Extract left hand keypoints (flattened)
    lh = np.array([[res.x, res.y, res.z] 
                  for res in results.left_hand_landmarks.landmark]).flatten() \
                  if results.left_hand_landmarks else np.zeros(21*3)
    
    # Extract right hand keypoints (flattened)
    rh = np.array([[res.x, res.y, res.z] 
                  for res in results.right_hand_landmarks.landmark]).flatten() \
                  if results.right_hand_landmarks else np.zeros(21*3)
    
    return np.concatenate([pose, face, lh, rh])

def predict_sequence(keypoint_sequence):
    """Predict action from a sequence of keypoints"""
    if model is None or not actions:
        print("Model or label map not loaded - cannot predict")
        return None, 0.0
    
    # Add batch dimension and normalize
    input_data = np.expand_dims(keypoint_sequence, axis=0)
    input_data_norm = (input_data - X_mean) / (X_std + 1e-8)
    
    # Make prediction
    predictions = model.predict(input_data_norm, verbose=0)[0]
    predicted_idx = np.argmax(predictions)
    predicted_action = reversed_label_map.get(predicted_idx, "UNKNOWN")
    confidence = float(predictions[predicted_idx])
    
    return predicted_action, confidence

def process_video_and_predict(video_path):
    """Process a video file and predict the action"""
    if model is None:
        print("Model not loaded - cannot predict")
        return None, 0.0
    
    cap = cv2.VideoCapture(video_path)
    sequence = []
    
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process frame with Mediapipe
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = holistic.process(image)
            
            # Extract keypoints
            keypoints = extract_keypoints(results)
            sequence.append(keypoints)
            
            # Stop when we have enough frames
            if len(sequence) == SEQUENCE_LENGTH:
                break
                
    cap.release()
    
    if len(sequence) == SEQUENCE_LENGTH:
        sequence_np = np.array(sequence)
        return predict_sequence(sequence_np)
    else:
        print(f"Video only had {len(sequence)} frames (need {SEQUENCE_LENGTH})")
        return None, 0.0

def process_directory_and_predict(dataset_path):
    """Process all videos in a directory and predict their actions"""
    if not os.path.exists(dataset_path):
        print(f"Directory not found: {dataset_path}")
        return
    
    # Process each video file in the directory
    for video_name in os.listdir(dataset_path):
        if not video_name.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
            continue
            
        video_path = os.path.join(dataset_path, video_name)
        print(f"\nProcessing: {video_name}")
        
        # Process video and predict
        action, confidence = process_video_and_predict(video_path)
        
        if action:
            print(f"Predicted action: {action} (confidence: {confidence:.2f})")
        else:
            print("Could not make prediction")

if __name__ == '__main__':
    # Load model and assets first
    load_model_and_assets()
    
    # Example usage:
    # Process a single video
    parser = argparse.ArgumentParser(description="Run hand detection on a video.")
    parser.add_argument("--video", type=str, required=True, help="Path to the input video file")
    
    args = parser.parse_args()
    video_path = args.video 
    #video_path = 'dataset/cold/11621.mp4'  # Change to your video path
    if os.path.exists(video_path):
        action, confidence = process_video_and_predict(video_path)
        
        # Structure the response as JSON with 'phrase' and 'confidence'
        result = {
            "success": True,
            "error": None,
            "phrase": action if action else "UNKNOWN",  # Renamed from 'action' to 'phrase'
            "confidence": round(float(confidence) if confidence else 0.0,2),
            "video_path": video_path  # Optional: for debugging
        }
        
        # Print JSON (Node.js will capture this as stdout)
        print(json.dumps(result))
    else:
        # Return error in JSON format if video not found
        error_result = {
            "success": False,
            "error": f"Video file not found: {video_path}",
            "phrase": None,
            "confidence": 0.0,
            "video_path": video_path
        }
        print(json.dumps(error_result))
    # Or process a directory of videos
    # dataset_path = 'test_videos'  # Directory containing videos
    # process_directory_and_predict(dataset_path)