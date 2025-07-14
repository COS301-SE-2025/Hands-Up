import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import os
from tensorflow.keras.models import load_model # For loading the saved model
import time # For measuring FPS and recording duration

# --- Configuration (must match training parameters) ---
MODEL_PATH = 'saved_models/best_sign_classifier_model.keras'
PROCESSED_DATA_CSV = 'wlasl_nslt_100_final_processed_data_augmented.csv' # To get gloss mapping

SEQUENCE_LENGTH = 60 # Must match data_preprocessor.py
EXPECTED_COORDS_PER_FRAME = 1662 # Must match data_preprocessor.py

# Define the expected number of coordinates for each type of landmark (from data_preprocessor.py)
NUM_POSE_COORDS_SINGLE = 33 * 4
NUM_HAND_COORDS_SINGLE = 21 * 3
NUM_FACE_COORDS_SINGLE = 468 * 3

# --- Real-time Translation Specific Parameters ---
RECORDING_DURATION_SECONDS = 5 # How long to record after toggle (5-6 seconds as requested)
CONFIDENCE_THRESHOLD = 0.60 # Only show prediction if confidence is >= 70%

# States for the application
STATE_IDLE = "IDLE (Press 'S' to record)"
STATE_RECORDING = "RECORDING..."
STATE_PREDICTING = "PREDICTING..."
STATE_RESULT = "RESULT: "

# --- Utility Functions (Copied/Adapted from data_preprocessor.py) ---

def normalize_landmarks(landmarks_sequence):
    """
    Normalizes a sequence of landmarks (frames, coords) to be translation and scale invariant.
    Handles single frames (ndim=1) or multiple frames (ndim=2).
    """
    if landmarks_sequence.size == 0:
        return landmarks_sequence.astype(np.float32) # Return empty if empty, with correct dtype

    # Ensure landmarks_sequence is 2D (num_frames, total_coords)
    if landmarks_sequence.ndim == 1:
        input_is_single_frame = True
        landmarks_sequence_2d = np.expand_dims(landmarks_sequence, axis=0) # Make it (1, total_coords)
    else:
        input_is_single_frame = False
        landmarks_sequence_2d = landmarks_sequence

    normalized_sequences = []
    for frame_landmarks in landmarks_sequence_2d:
        # Initial check for completely zeroed-out frames (no detection at all)
        if np.all(frame_landmarks == 0):
            normalized_sequences.append(np.zeros(EXPECTED_COORDS_PER_FRAME, dtype=np.float32))
            continue # Skip to next frame

        # Extract subsets from the current frame_landmarks
        # This assumes the order of concatenation as in data_preprocessor.py
        pose_coords_flat = frame_landmarks[0 : NUM_POSE_COORDS_SINGLE]
        left_hand_coords_flat = frame_landmarks[NUM_POSE_COORDS_SINGLE : NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE]
        right_hand_coords_flat = frame_landmarks[NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE : NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE]
        face_coords_flat = frame_landmarks[NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE : ]
        
        all_parts_data = [
            (pose_coords_flat, 4, [0.0] * NUM_POSE_COORDS_SINGLE),
            (left_hand_coords_flat, 3, [0.0] * NUM_HAND_COORDS_SINGLE),
            (right_hand_coords_flat, 3, [0.0] * NUM_HAND_COORDS_SINGLE),
            (face_coords_flat, 3, [0.0] * NUM_FACE_COORDS_SINGLE)
        ]
        
        normalized_frame_parts = []
        for flat_lms, coords_per_lm, original_padded_list_template in all_parts_data:
            if np.all(flat_lms == 0): # Check if this specific part is all zeros
                normalized_frame_parts.append(np.array(original_padded_list_template, dtype=np.float32))
                continue
            
            lms_array = flat_lms.reshape(-1, coords_per_lm)
            coords_for_mean = lms_array[:, :3] if coords_per_lm == 4 else lms_array
            
            # If coordinates for mean are all zeros, it means the part wasn't detected effectively.
            # Append zeros for this part, as normalization won't work on all zeros.
            if np.all(coords_for_mean == 0):
                 normalized_frame_parts.append(np.array(original_padded_list_template, dtype=np.float32))
                 continue

            mean_coords = np.mean(coords_for_mean, axis=0)
            translated_lms = lms_array.copy()
            translated_lms[:, :3] -= mean_coords

            scale_factor = np.max(np.linalg.norm(translated_lms[:, :3], axis=1))
            if scale_factor > 1e-6: # Avoid division by zero
                translated_lms[:, :3] /= scale_factor
            
            normalized_frame_parts.append(translated_lms.flatten())
            
        combined_normalized_frame = np.concatenate(normalized_frame_parts).astype(np.float32)
        
        # Ensure the combined frame is exactly EXPECTED_COORDS_PER_FRAME length
        if len(combined_normalized_frame) < EXPECTED_COORDS_PER_FRAME:
            combined_normalized_frame = np.pad(combined_normalized_frame, (0, EXPECTED_COORDS_PER_FRAME - len(combined_normalized_frame)), 'constant', constant_values=0.0)
        elif len(combined_normalized_frame) > EXPECTED_COORDS_PER_FRAME:
            combined_normalized_frame = combined_normalized_frame[:EXPECTED_COORDS_PER_FRAME]

        normalized_sequences.append(combined_normalized_frame)
            
    result_array = np.array(normalized_sequences, dtype=np.float32)
    
    # If input was a single frame, return a single frame (1D array)
    if input_is_single_frame:
        return result_array[0] # Return the 1D array
    else:
        return result_array # Return 2D array (num_frames, total_coords)


def pad_or_truncate_sequence(sequence, target_length, feature_dimension):
    """
    Pads or truncates a sequence to a target_length.
    Args:
        sequence (np.ndarray): The input sequence (num_frames, feature_dimension).
        target_length (int): The desired number of frames.
        feature_dimension (int): The number of features per frame.
    Returns:
        np.ndarray: The padded/truncated sequence.
    """
    if sequence.shape[0] < target_length:
        padding = np.zeros((target_length - sequence.shape[0], feature_dimension), dtype=np.float32)
        padded_sequence = np.vstack((sequence, padding))
    elif sequence.shape[0] > target_length:
        padded_sequence = sequence[:target_length, :]
    else:
        padded_sequence = sequence
    return padded_sequence


# --- Main Real-time Translator Logic ---
if __name__ == "__main__":
    # Load the trained model
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model not found at {MODEL_PATH}. Please ensure your training completed and saved the model.")
        exit()
    
    print(f"Loading model from: {MODEL_PATH}")
    model = load_model(MODEL_PATH)
    model.summary()

    # Load gloss mapping
    if not os.path.exists(PROCESSED_DATA_CSV):
        print(f"Error: Processed data CSV not found at {PROCESSED_DATA_CSV}. Cannot map gloss IDs to names.")
        exit()
    
    df_final = pd.read_csv(PROCESSED_DATA_CSV)
    unique_glosses = df_final['gloss'].unique()
    id_to_gloss = {i: gloss for i, gloss in enumerate(unique_glosses)}
    print(f"Loaded {len(id_to_gloss)} gloss mappings.")

    # Initialize MediaPipe Holistic for real-time inference
    mp_holistic = mp.solutions.holistic.Holistic(
        static_image_mode=False,
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    # Initialize webcam
    cap = cv2.VideoCapture(0) # 0 for default webcam. Change if you have multiple cameras.
    if not cap.isOpened():
        print("Error: Could not open webcam. Make sure no other apps are using it.")
        exit()

    print(f"\nReal-time translation started.")
    print(f"Press 'S' to start {RECORDING_DURATION_SECONDS}-second recording.")
    print("Press 'Q' to quit.")

    # Application state variables
    current_state = STATE_IDLE
    recording_start_time = 0
    recorded_raw_landmarks_buffer = [] # Stores raw landmarks for frames during recording
    
    display_prediction_text = ""
    display_confidence_text = ""
    last_prediction_time = 0 # To control how long a result is displayed

    fps_start_time = time.time()
    fps_frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame.")
            break

        frame = cv2.flip(frame, 1) # Flip for selfie-view

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False

        results = mp_holistic.process(image)

        image.flags.writeable = True
        frame = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Draw landmarks for visualization
        mp.solutions.drawing_utils.draw_landmarks(
            frame, results.pose_landmarks, mp.solutions.holistic.POSE_CONNECTIONS,
            mp.solutions.drawing_utils.DrawingSpec(color=(80,22,10), thickness=2, circle_radius=4),
            mp.solutions.drawing_utils.DrawingSpec(color=(80,44,121), thickness=2, circle_radius=2)
        )
        mp.solutions.drawing_utils.draw_landmarks(
            frame, results.left_hand_landmarks, mp.solutions.holistic.HAND_CONNECTIONS,
            mp.solutions.drawing_utils.DrawingSpec(color=(121,22,76), thickness=2, circle_radius=4),
            mp.solutions.drawing_utils.DrawingSpec(color=(121,44,250), thickness=2, circle_radius=2)
        )
        mp.solutions.drawing_utils.draw_landmarks(
            frame, results.right_hand_landmarks, mp.solutions.holistic.HAND_CONNECTIONS,
            mp.solutions.drawing_utils.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=4),
            mp.solutions.drawing_utils.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
        )
        mp.solutions.drawing_utils.draw_landmarks(
            frame, results.face_landmarks, mp.solutions.holistic.FACEMESH_CONTOURS,
            mp.solutions.drawing_utils.DrawingSpec(color=(80,110,10), thickness=1, circle_radius=1),
            mp.solutions.drawing_utils.DrawingSpec(color=(80,256,121), thickness=1, circle_radius=1)
        )

        # --- Capture Landmarks based on State ---
        current_frame_raw_landmarks_flat = np.zeros(EXPECTED_COORDS_PER_FRAME, dtype=np.float32)
        
        # Populate based on detection (same logic as in data_preprocessor.py for raw extraction)
        current_idx = 0
        
        if results.pose_landmarks:
            pose_lms_flat = []
            for landmark in results.pose_landmarks.landmark:
                pose_lms_flat.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])
            current_frame_raw_landmarks_flat[current_idx : current_idx + len(pose_lms_flat)] = pose_lms_flat
        current_idx += NUM_POSE_COORDS_SINGLE

        if results.left_hand_landmarks:
            lh_lms_flat = []
            for landmark in results.left_hand_landmarks.landmark:
                lh_lms_flat.extend([landmark.x, landmark.y, landmark.z])
            current_frame_raw_landmarks_flat[current_idx : current_idx + len(lh_lms_flat)] = lh_lms_flat
        current_idx += NUM_HAND_COORDS_SINGLE

        if results.right_hand_landmarks:
            rh_lms_flat = []
            for landmark in results.right_hand_landmarks.landmark:
                rh_lms_flat.extend([landmark.x, landmark.y, landmark.z])
            current_frame_raw_landmarks_flat[current_idx : current_idx + len(rh_lms_flat)] = rh_lms_flat
        current_idx += NUM_HAND_COORDS_SINGLE

        if results.face_landmarks:
            face_lms_flat = []
            for landmark in results.face_landmarks.landmark:
                face_lms_flat.extend([landmark.x, landmark.y, landmark.z])
            current_frame_raw_landmarks_flat[current_idx : current_idx + len(face_lms_flat)] = face_lms_flat
        
        # Add to recording buffer if in RECORDING state
        if current_state == STATE_RECORDING:
            recorded_raw_landmarks_buffer.append(current_frame_raw_landmarks_flat)
            # Display recording progress
            elapsed_time = time.time() - recording_start_time
            display_prediction_text = f"{current_state} ({int(elapsed_time)}/{RECORDING_DURATION_SECONDS}s)"
            if elapsed_time >= RECORDING_DURATION_SECONDS:
                current_state = STATE_PREDICTING # Transition to predicting state

        # --- Prediction Logic ---
        if current_state == STATE_PREDICTING:
            print("Predicting...")
            current_state = STATE_IDLE # Reset state immediately

            # Convert buffer to numpy array of raw landmarks
            if not recorded_raw_landmarks_buffer:
                print("Warning: No frames recorded for prediction.")
                recorded_raw_landmarks_buffer = [] # Clear buffer
                display_prediction_text = "No motion recorded."
                display_confidence_text = ""
                last_prediction_time = time.time()
                continue # Skip prediction if buffer is empty

            # Normalize the entire recorded sequence (this returns a 2D array (frames, coords))
            processed_sequence = normalize_landmarks(np.array(recorded_raw_landmarks_buffer))
            
            # Pad or truncate the processed sequence to the model's expected length
            final_input_sequence = pad_or_truncate_sequence(
                processed_sequence, 
                SEQUENCE_LENGTH, 
                EXPECTED_COORDS_PER_FRAME
            )

            # Reshape for model input: (1, SEQUENCE_LENGTH, EXPECTED_COORDS_PER_FRAME)
            final_input_sequence = np.expand_dims(final_input_sequence, axis=0) 
            
            # Make prediction
            predictions = model.predict(final_input_sequence, verbose=0)
            predicted_class_id = np.argmax(predictions)
            prediction_confidence = predictions[0, predicted_class_id]

            # Map ID to gloss
            predicted_gloss = id_to_gloss.get(predicted_class_id, "Unknown")
            
            # Apply confidence threshold
            if prediction_confidence >= CONFIDENCE_THRESHOLD:
                display_prediction_text = f"{STATE_RESULT} {predicted_gloss}"
                display_confidence_text = f"Confidence: {prediction_confidence:.2f}"
            else:
                display_prediction_text = "Too low confidence."
                display_confidence_text = f"Confidence: {prediction_confidence:.2f}"
            
            last_prediction_time = time.time() # Mark time for displaying result
            recorded_raw_landmarks_buffer = [] # Clear buffer after prediction

        # --- Display Current State/Result ---
        # Clear previous result after a short display time if idle
        if current_state == STATE_IDLE and time.time() - last_prediction_time > 3: # Display result for 3 seconds
             display_prediction_text = STATE_IDLE
             display_confidence_text = ""

        cv2.putText(frame, display_prediction_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(frame, display_confidence_text, (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2, cv2.LINE_AA) # Orange for confidence

        # Display FPS
        fps_frame_count += 1
        if time.time() - fps_start_time >= 1: # Update FPS every second
            fps = fps_frame_count / (time.time() - fps_start_time)
            cv2.putText(frame, f"FPS: {fps:.1f}", (frame.shape[1] - 150, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2, cv2.LINE_AA)
            fps_frame_count = 0
            fps_start_time = time.time()

        cv2.imshow('Sign Language Translator', frame)

        # --- Handle Key Presses ---
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'): # Press 'q' to quit
            break
        elif key == ord('s') and current_state == STATE_IDLE: # Press 's' to start recording
            current_state = STATE_RECORDING
            recording_start_time = time.time()
            recorded_raw_landmarks_buffer = [] # Clear buffer for new recording
            display_prediction_text = STATE_RECORDING
            display_confidence_text = ""
            print("Recording started...")

    cap.release()
    cv2.destroyAllWindows()
    mp_holistic.close()
    print("\nReal-time translation stopped.")