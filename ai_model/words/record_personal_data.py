import cv2
import mediapipe as mp
import numpy as np
import os
import time

# --- Configuration ---
# Directory to save recorded raw landmark data
OUTPUT_RECORDINGS_DIR = 'my_recorded_signs'

# MediaPipe parameters (should match what you used for data extraction)
MP_MODEL_COMPLEXITY = 1
MP_DETECTION_CONFIDENCE = 0.5
MP_TRACKING_CONFIDENCE = 0.5

# Recording parameters
DEFAULT_RECORDING_DURATION_SECONDS = 3.6 # Match SEQUENCE_LENGTH / FPS (90 frames / 25 FPS)

# Expected number of coordinates per frame (from previous steps)
EXPECTED_COORDS_PER_FRAME = 1662

# Define the expected number of coordinates for each type of landmark
NUM_POSE_COORDS_SINGLE = 33 * 4
NUM_HAND_COORDS_SINGLE = 21 * 3
NUM_FACE_COORDS_SINGLE = 468 * 3


def extract_raw_landmarks(results):
    """
    Extracts raw landmark data from MediaPipe results into a flat numpy array.
    This logic should match how you populate current_frame_raw_landmarks_flat in realtime_translator.py
    """
    current_frame_raw_landmarks_flat = np.zeros(EXPECTED_COORDS_PER_FRAME, dtype=np.float32)
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
    
    return current_frame_raw_landmarks_flat


if __name__ == "__main__":
    os.makedirs(OUTPUT_RECORDINGS_DIR, exist_ok=True)

    mp_holistic = mp.solutions.holistic.Holistic(
        static_image_mode=False,
        model_complexity=MP_MODEL_COMPLEXITY,
        min_detection_confidence=MP_DETECTION_CONFIDENCE,
        min_tracking_confidence=MP_TRACKING_CONFIDENCE
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        exit()

    print(f"\n--- Personal Sign Recording Tool ---")
    print(f"Record duration: {DEFAULT_RECORDING_DURATION_SECONDS} seconds per sign.")
    print(f"Recorded landmark sequences will be saved to: {OUTPUT_RECORDINGS_DIR}")
    print("\nInstructions:")
    print("1. Enter the ASL gloss (word) for the sign you will perform.")
    print("2. Press ENTER.")
    print("3. You will see a 3-second countdown.")
    print("4. Perform the sign clearly during the recording (green background recommended).")
    print("5. The recording will stop automatically. The raw landmarks will be saved.")
    print("   If you see 'No motion detected', try again with more prominent movement.")
    print("6. Repeat or type 'q' and press ENTER to quit.")

    while True:
        gloss_input = input("\nEnter ASL gloss for sign (e.g., BLACK, APPLE), or 'q' to quit: ").strip().lower()
        if gloss_input == 'q':
            break
        if not gloss_input:
            print("Gloss cannot be empty. Please enter a valid gloss.")
            continue

        print(f"\n--- Preparing to record '{gloss_input.upper()}' ---")
        print("Starting countdown...")
        countdown_start = time.time()
        
        while time.time() - countdown_start < 3:
            ret, frame = cap.read()
            if not ret: break
            frame = cv2.flip(frame, 1)
            display_countdown = 3 - int(time.time() - countdown_start)
            cv2.putText(frame, f"Recording in {display_countdown}...", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2, cv2.LINE_AA)
            cv2.imshow('Recording Tool', frame)
            cv2.waitKey(1)
        
        print(f"Recording '{gloss_input.upper()}' NOW!")
        recorded_landmarks = []
        record_start_time = time.time()
        motion_detected = False

        while time.time() - record_start_time < DEFAULT_RECORDING_DURATION_SECONDS:
            ret, frame = cap.read()
            if not ret: break
            # frame = cv2.flip(frame, 1)
            
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = mp_holistic.process(image)
            image.flags.writeable = True
            frame = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            # Draw landmarks for visualization
            mp.solutions.drawing_utils.draw_landmarks(frame, results.pose_landmarks, mp.solutions.holistic.POSE_CONNECTIONS)
            mp.solutions.drawing_utils.draw_landmarks(frame, results.left_hand_landmarks, mp.solutions.holistic.HAND_CONNECTIONS)
            mp.solutions.drawing_utils.draw_landmarks(frame, results.right_hand_landmarks, mp.solutions.holistic.HAND_CONNECTIONS)
            mp.solutions.drawing_utils.draw_landmarks(frame, results.face_landmarks, mp.solutions.holistic.FACEMESH_CONTOURS)

            # Extract raw landmarks for saving
            current_frame_lms = extract_raw_landmarks(results)
            recorded_landmarks.append(current_frame_lms)

            # Basic motion detection (if not all zeros)
            if np.any(current_frame_lms != 0):
                motion_detected = True

            cv2.putText(frame, f"Recording {gloss_input.upper()} ({int(time.time() - record_start_time)}s)", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
            cv2.imshow('Recording Tool', frame)
            cv2.waitKey(1)

        print(f"Recording of '{gloss_input.upper()}' finished.")
        
        if not motion_detected:
            print("Warning: No significant motion (landmarks != 0) detected during recording. Consider trying again.")
        
        if recorded_landmarks:
            recorded_landmarks_array = np.array(recorded_landmarks, dtype=np.float32)
            timestamp = int(time.time())
            filename = f"{gloss_input}_{timestamp}.npy"
            filepath = os.path.join(OUTPUT_RECORDINGS_DIR, filename)
            np.save(filepath, recorded_landmarks_array)
            print(f"Saved {recorded_landmarks_array.shape[0]} frames to {filepath}")
        else:
            print("No frames were recorded.")

    cap.release()
    cv2.destroyAllWindows()
    mp_holistic.close()
    print("\nRecording tool stopped.")