import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import os
from tensorflow.keras.models import load_model
import time

MODEL_PATH = 'saved_models/best_sign_classifier_model_125_words_seq90.keras'
PROCESSED_DATA_CSV = 'wlasl_125_words_personal_final_processed_data_augmented_seq90.csv'

SEQUENCE_LENGTH = 90
EXPECTED_COORDS_PER_FRAME = 1662

# Define the expected number of coordinates for each type of landmark
NUM_POSE_COORDS_SINGLE = 33 * 4
NUM_HAND_COORDS_SINGLE = 21 * 3
NUM_FACE_COORDS_SINGLE = 468 * 3

RECORDING_DURATION_SECONDS = 3.6
CONFIDENCE_THRESHOLD = 0.50 # Minimum confidence for a prediction to be displayed


MOTION_THRESHOLD = 0.05 # How much landmark movement is needed to trigger a recording
COOLDOWN_DURATION = 2.0 # Seconds to wait after a prediction before looking for a new sign
TIME_BETWEEN_WORDS = 1.0 # Minimum time between adding new, distinct words to the sentence
SENTENCE_CLEAR_DURATION = 8.0 # Time of inactivity before the sentence is cleared

# States
STATE_IDLE = "IDLE (Signing will auto-record)"
STATE_RECORDING = "RECORDING..."
STATE_PREDICTING = "PREDICTING..."
STATE_RESULT = "" 
STATE_COOLDOWN = "COOLDOWN..."

def normalize_landmarks(landmarks_sequence):
    """
    Normalizes a sequence of landmarks (frames, coords) to be translation and scale invariant.
    Handles single frames (ndim=1) or multiple frames (ndim=2).
    """
    if landmarks_sequence.size == 0:
        return landmarks_sequence.astype(np.float32)

    if landmarks_sequence.ndim == 1:
        input_is_single_frame = True
        landmarks_sequence_2d = np.expand_dims(landmarks_sequence, axis=0)
    else:
        input_is_single_frame = False
        landmarks_sequence_2d = landmarks_sequence

    normalized_sequences = []
    for frame_landmarks in landmarks_sequence_2d:
        if np.all(frame_landmarks == 0):
            normalized_sequences.append(np.zeros(EXPECTED_COORDS_PER_FRAME, dtype=np.float32))
            continue

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
            if np.all(flat_lms == 0):
                normalized_frame_parts.append(np.array(original_padded_list_template, dtype=np.float32))
                continue
            
            lms_array = flat_lms.reshape(-1, coords_per_lm)
            coords_for_mean = lms_array[:, :3] if coords_per_lm == 4 else lms_array
            
            if np.all(coords_for_mean == 0):
                 normalized_frame_parts.append(np.array(original_padded_list_template, dtype=np.float32))
                 continue

            mean_coords = np.mean(coords_for_mean, axis=0)
            translated_lms = lms_array.copy()
            translated_lms[:, :3] -= mean_coords

            scale_factor = np.max(np.linalg.norm(translated_lms[:, :3], axis=1))
            if scale_factor > 1e-6:
                translated_lms[:, :3] /= scale_factor
            
            normalized_frame_parts.append(translated_lms.flatten())
            
        combined_normalized_frame = np.concatenate(normalized_frame_parts).astype(np.float32)
        
        if len(combined_normalized_frame) < EXPECTED_COORDS_PER_FRAME:
            combined_normalized_frame = np.pad(combined_normalized_frame, (0, EXPECTED_COORDS_PER_FRAME - len(combined_normalized_frame)), 'constant', constant_values=0.0)
        elif len(combined_normalized_frame) > EXPECTED_COORDS_PER_FRAME:
            combined_normalized_frame = combined_normalized_frame[:EXPECTED_COORDS_PER_FRAME]

        normalized_sequences.append(combined_normalized_frame)
            
    result_array = np.array(normalized_sequences, dtype=np.float32)
    
    if input_is_single_frame:
        return result_array[0]
    else:
        return result_array

def pad_or_truncate_sequence(sequence, target_length, feature_dimension):
    """Pads or truncates a sequence to a target_length."""
    if sequence.shape[0] < target_length:
        padding = np.zeros((target_length - sequence.shape[0], feature_dimension), dtype=np.float32)
        padded_sequence = np.vstack((sequence, padding))
    elif sequence.shape[0] > target_length:
        padded_sequence = sequence[:target_length, :]
    else:
        padded_sequence = sequence
    return padded_sequence

def calculate_motion(current_lms, previous_lms):
    """Calculates the total change in landmark positions to detect motion."""
    if previous_lms is None or np.all(previous_lms == 0):
        return 0.0
    
    pose_lms_change = np.linalg.norm(current_lms[0:33*4:4] - previous_lms[0:33*4:4])
    hands_lms_change = np.linalg.norm(current_lms[33*4:] - previous_lms[33*4:])
    
    return pose_lms_change + hands_lms_change


if __name__ == "__main__":
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model not found at {MODEL_PATH}. Please ensure your training completed and saved the model.")
        exit()

    print(f"Loading model from: {MODEL_PATH}")
    model = load_model(MODEL_PATH)
    model.summary()

    if not os.path.exists(PROCESSED_DATA_CSV):
        print(f"Error: Processed data CSV not found at {PROCESSED_DATA_CSV}. Cannot map gloss IDs to names.")
        exit()

    df_final = pd.read_csv(PROCESSED_DATA_CSV)
    unique_glosses = df_final['gloss'].unique()
    id_to_gloss = {i: gloss for i, gloss in enumerate(unique_glosses)}
    ordered_gloss_names = [id_to_gloss[i] for i in range(len(id_to_gloss))]
    print(f"Loaded {len(ordered_gloss_names)} gloss mappings.")

    mp_holistic = mp.solutions.holistic.Holistic(
        static_image_mode=False,
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam. Make sure no other apps are using it.")
        exit()

    print(f"\nReal-time translation started.")
    print(f"Signing motion will automatically trigger a {RECORDING_DURATION_SECONDS}-second recording.")
    print("Press 'Q' to quit.")
    print("--------------------------------------------------")
    print(f"Console will show predictions for all {len(ordered_gloss_names)} words.")
    print("--------------------------------------------------")

    current_state = STATE_IDLE
    recording_start_time = 0
    cooldown_start_time = 0
    recorded_raw_landmarks_buffer = []
    previous_frame_raw_landmarks = None

    display_status_text = STATE_IDLE
    display_confidence_text = ""
    current_sentence = []
    last_word_added = ""
    last_activity_time = time.time()
    
    fps_start_time = time.time()
    fps_frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame.")
            break

        # This line will flip the image horizontally.
        # This creates an un-mirrored view, as if someone is facing you.
        # frame = cv2.flip(frame, 1)

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = mp_holistic.process(image)
        image.flags.writeable = True
        frame = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Draw landmarks 
        mp.solutions.drawing_utils.draw_landmarks(frame, results.pose_landmarks, mp.solutions.holistic.POSE_CONNECTIONS)
        mp.solutions.drawing_utils.draw_landmarks(frame, results.left_hand_landmarks, mp.solutions.holistic.HAND_CONNECTIONS)
        mp.solutions.drawing_utils.draw_landmarks(frame, results.right_hand_landmarks, mp.solutions.holistic.HAND_CONNECTIONS)
        mp.solutions.drawing_utils.draw_landmarks(frame, results.face_landmarks, mp.solutions.holistic.FACEMESH_CONTOURS)

        current_frame_raw_landmarks_flat = np.zeros(EXPECTED_COORDS_PER_FRAME, dtype=np.float32)
        current_idx = 0
        if results.pose_landmarks:
            pose_lms_flat = [coord for landmark in results.pose_landmarks.landmark for coord in [landmark.x, landmark.y, landmark.z, landmark.visibility]]
            current_frame_raw_landmarks_flat[current_idx : current_idx + len(pose_lms_flat)] = pose_lms_flat
        current_idx += NUM_POSE_COORDS_SINGLE

        if results.left_hand_landmarks:
            lh_lms_flat = [coord for landmark in results.left_hand_landmarks.landmark for coord in [landmark.x, landmark.y, landmark.z]]
            current_frame_raw_landmarks_flat[current_idx : current_idx + len(lh_lms_flat)] = lh_lms_flat
        current_idx += NUM_HAND_COORDS_SINGLE

        if results.right_hand_landmarks:
            rh_lms_flat = [coord for landmark in results.right_hand_landmarks.landmark for coord in [landmark.x, landmark.y, landmark.z]]
            current_frame_raw_landmarks_flat[current_idx : current_idx + len(rh_lms_flat)] = rh_lms_flat
        current_idx += NUM_HAND_COORDS_SINGLE

        if results.face_landmarks:
            face_lms_flat = [coord for landmark in results.face_landmarks.landmark for coord in [landmark.x, landmark.y, landmark.z]]
            current_frame_raw_landmarks_flat[current_idx : current_idx + len(face_lms_flat)] = face_lms_flat
        
        # --- NEW LOGIC FOR AUTOMATIC RECORDING & SENTENCE BUILDING ---
        if current_state == STATE_IDLE or current_state == STATE_COOLDOWN:
            motion = calculate_motion(current_frame_raw_landmarks_flat, previous_frame_raw_landmarks)
            previous_frame_raw_landmarks = current_frame_raw_landmarks_flat
            
            if current_state == STATE_IDLE and motion > MOTION_THRESHOLD:
                current_state = STATE_RECORDING
                recording_start_time = time.time()
                recorded_raw_landmarks_buffer = [] # Reset buffer at start of new sign
                print("Recording started automatically...")

        if current_state == STATE_RECORDING:
            recorded_raw_landmarks_buffer.append(current_frame_raw_landmarks_flat)
            elapsed_time = time.time() - recording_start_time
            display_status_text = f"{STATE_RECORDING} ({int(elapsed_time)}/{RECORDING_DURATION_SECONDS}s)"
            if elapsed_time >= RECORDING_DURATION_SECONDS:
                current_state = STATE_PREDICTING

        if current_state == STATE_PREDICTING:
            print("\n--- NEW PREDICTION ---")
            if not recorded_raw_landmarks_buffer:
                print("Warning: No frames recorded for prediction.")
            else:
                processed_sequence = normalize_landmarks(np.array(recorded_raw_landmarks_buffer))
                final_input_sequence = pad_or_truncate_sequence(processed_sequence, SEQUENCE_LENGTH, EXPECTED_COORDS_PER_FRAME)
                final_input_sequence = np.expand_dims(final_input_sequence, axis=0)
                predictions = model.predict(final_input_sequence, verbose=0)
                all_scores = predictions[0]
                
                print("Confidence scores for all classes:")
                for i in np.argsort(all_scores)[::-1]:
                    gloss_name = ordered_gloss_names[i]
                    score = all_scores[i]
                    print(f"   {gloss_name.upper():<10}: {score:.4f}")

                predicted_class_id = np.argmax(predictions)
                prediction_confidence = predictions[0, predicted_class_id]
                predicted_gloss = id_to_gloss.get(predicted_class_id, "Unknown")
                
                # Logic to add a word to the sentence
                if prediction_confidence >= CONFIDENCE_THRESHOLD and predicted_gloss != last_word_added and (time.time() - last_activity_time) > TIME_BETWEEN_WORDS:
                    current_sentence.append(predicted_gloss)
                    last_word_added = predicted_gloss
                    last_activity_time = time.time() # This timer now tracks the last activity, not just prediction

                display_confidence_text = f"Confidence: {prediction_confidence:.2f}"
            
            recorded_raw_landmarks_buffer = []
            cooldown_start_time = time.time()
            current_state = STATE_COOLDOWN

        if current_state == STATE_COOLDOWN:
            elapsed_cooldown = time.time() - cooldown_start_time
            display_status_text = f"Resuming in {COOLDOWN_DURATION - elapsed_cooldown:.1f}s"
            if elapsed_cooldown > COOLDOWN_DURATION:
                current_state = STATE_IDLE
                display_status_text = STATE_IDLE
        
        # Clear the sentence if there's been no activity for a while
        if current_sentence and (time.time() - last_activity_time) > SENTENCE_CLEAR_DURATION:
            current_sentence = []
            last_word_added = ""
            display_status_text = "Sentence cleared."


        # Text on screen (UPDATED to show sentence and status)
        sentence_text = " ".join(current_sentence).upper()
        cv2.putText(frame, display_status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(frame, sentence_text, (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
        cv2.putText(frame, display_confidence_text, (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2, cv2.LINE_AA)

        fps_frame_count += 1
        if time.time() - fps_start_time >= 1:
            fps = fps_frame_count / (time.time() - fps_start_time)
            cv2.putText(frame, f"FPS: {fps:.1f}", (frame.shape[1] - 150, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2, cv2.LINE_AA)
            fps_frame_count = 0
            fps_start_time = time.time()

        cv2.imshow('Sign Language Translator', frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    mp_holistic.close()
    print("\nReal-time translation stopped.")