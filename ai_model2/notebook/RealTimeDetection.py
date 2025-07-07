import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import load_model
import os
import pickle
import time

# Mediapipe setup
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'action_model.h5')
NORMALIZATION_PARAMS_PATH = os.path.join(SCRIPT_DIR, 'normalization_params.npy')
LABEL_MAP_PATH = os.path.join(SCRIPT_DIR, 'label_map.pkl')
SEQUENCE_LENGTH = 30  # Number of frames needed for prediction
PREDICTION_DELAY = 2  # Seconds to wait between predictions

# Global variables
model = None
X_mean, X_std = 0, 1
actions = []
label_map = {}
reversed_label_map = {}

def load_model_and_assets():
    global model, X_mean, X_std, actions, label_map, reversed_label_map
    try:
        model = load_model(MODEL_PATH)
        X_mean, X_std = np.load(NORMALIZATION_PARAMS_PATH)
        with open(LABEL_MAP_PATH, 'rb') as f:
            label_map = pickle.load(f)
        actions = sorted(list(label_map.keys()))
        reversed_label_map = {v: k for k, v in label_map.items()}
    except Exception as e:
        print(f"Error loading assets: {e}")
        raise

def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] 
                    for res in results.pose_landmarks.landmark]).flatten() \
                    if results.pose_landmarks else np.zeros(33*4)
    face = np.array([[res.x, res.y, res.z] 
                    for res in results.face_landmarks.landmark]).flatten() \
                    if results.face_landmarks else np.zeros(468*3)
    lh = np.array([[res.x, res.y, res.z] 
                  for res in results.left_hand_landmarks.landmark]).flatten() \
                  if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] 
                  for res in results.right_hand_landmarks.landmark]).flatten() \
                  if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, face, lh, rh])

def predict_sequence(keypoint_sequence):
    input_data = np.expand_dims(keypoint_sequence, axis=0)
    input_data_norm = (input_data - X_mean) / (X_std + 1e-8)
    predictions = model.predict(input_data_norm, verbose=0)[0]
    predicted_idx = np.argmax(predictions)
    return reversed_label_map.get(predicted_idx, "UNKNOWN"), float(predictions[predicted_idx])

def draw_loading_bar(image, progress):
    bar_width = 200
    bar_height = 20
    x, y = 50, 50
    cv2.rectangle(image, (x, y), (x + bar_width, y + bar_height), (100, 100, 100), 2)
    cv2.rectangle(image, (x, y), (x + int(bar_width * progress), y + bar_height), (0, 255, 0), -1)
    cv2.putText(image, "Processing...", (x, y - 10), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

def main():
    load_model_and_assets()
    
    sequence = []
    sentence = []
    last_prediction_time = 0
    
    cap = cv2.VideoCapture(0)
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                continue
                
            # Process frame
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = holistic.process(image)
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            # Draw landmarks
            mp_drawing.draw_landmarks(image, results.face_landmarks, mp_holistic.FACEMESH_TESSELATION)
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS)
            mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
            mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
            
            # Only collect frames when hands are visible
            if results.left_hand_landmarks or results.right_hand_landmarks:
                keypoints = extract_keypoints(results)
                sequence.append(keypoints)
                sequence = sequence[-SEQUENCE_LENGTH:]
                
                # Show progress bar
                progress = len(sequence) / SEQUENCE_LENGTH
                draw_loading_bar(image, progress)
                
                # Make prediction when we have enough frames
                current_time = time.time()
                if len(sequence) == SEQUENCE_LENGTH and current_time - last_prediction_time > PREDICTION_DELAY:
                    action, confidence = predict_sequence(np.array(sequence))
                    if confidence > 0.7:  # Confidence threshold
                        sentence.append(action)
                        if len(sentence) > 5:
                            sentence = sentence[-5:]
                    last_prediction_time = current_time
                    sequence = []  # Reset for next prediction
            else:
                sequence = []  # Reset if hands disappear
            
            # Display results
            cv2.rectangle(image, (0, 0), (640, 40), (245, 117, 16), -1)
            cv2.putText(image, ' '.join(sentence), (3, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
            
            cv2.imshow('Sign Language Recognition', image)
            
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break
                
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()