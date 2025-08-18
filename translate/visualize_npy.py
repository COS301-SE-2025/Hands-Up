import cv2
import numpy as np
import mediapipe as mp
import os
import time

# --- Configuration (should match your recording script) ---
OUTPUT_RECORDINGS_DIR = 'my_recorded_signs'
EXPECTED_COORDS_PER_FRAME = 1662
NUM_POSE_COORDS_SINGLE = 33 * 4
NUM_HAND_COORDS_SINGLE = 21 * 3
NUM_FACE_COORDS_SINGLE = 468 * 3
FRAME_DELAY_MS = 40  # Approximately 25 FPS (1000ms / 25)

# --- Helper function to reconstruct landmarks ---
def reconstruct_landmarks(flat_landmarks):
    """
    Reconstructs MediaPipe landmarks from a flat numpy array.
    """
    if np.all(flat_landmarks == 0):
        return None, None, None, None

    # Pose landmarks
    pose_lms = mp.solutions.pose.PoseLandmark.list()
    pose_lms_flat = flat_landmarks[0:NUM_POSE_COORDS_SINGLE]
    if np.any(pose_lms_flat != 0):
        pose_landmarks = mp.solutions.holistic.PoseLandmarks()
        for i, lm in enumerate(pose_lms):
            pose_landmarks.landmark[i].x = pose_lms_flat[i*4]
            pose_landmarks.landmark[i].y = pose_lms_flat[i*4+1]
            pose_landmarks.landmark[i].z = pose_lms_flat[i*4+2]
            pose_landmarks.landmark[i].visibility = pose_lms_flat[i*4+3]
    else:
        pose_landmarks = None

    # Left hand landmarks
    lh_lms_flat = flat_landmarks[NUM_POSE_COORDS_SINGLE:NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE]
    if np.any(lh_lms_flat != 0):
        left_hand_landmarks = mp.solutions.holistic.HandLandmarks()
        for i in range(21):
            left_hand_landmarks.landmark[i].x = lh_lms_flat[i*3]
            left_hand_landmarks.landmark[i].y = lh_lms_flat[i*3+1]
            left_hand_landmarks.landmark[i].z = lh_lms_flat[i*3+2]
    else:
        left_hand_landmarks = None

    # Right hand landmarks
    rh_lms_flat = flat_landmarks[NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE:NUM_POSE_COORDS_SINGLE + 2*NUM_HAND_COORDS_SINGLE]
    if np.any(rh_lms_flat != 0):
        right_hand_landmarks = mp.solutions.holistic.HandLandmarks()
        for i in range(21):
            right_hand_landmarks.landmark[i].x = rh_lms_flat[i*3]
            right_hand_landmarks.landmark[i].y = rh_lms_flat[i*3+1]
            right_hand_landmarks.landmark[i].z = rh_lms_flat[i*3+2]
    else:
        right_hand_landmarks = None

    # Face landmarks
    face_lms_flat = flat_landmarks[NUM_POSE_COORDS_SINGLE + 2*NUM_HAND_COORDS_SINGLE:]
    if np.any(face_lms_flat != 0):
        face_landmarks = mp.solutions.holistic.FaceLandmarks()
        for i in range(468):
            face_landmarks.landmark[i].x = face_lms_flat[i*3]
            face_landmarks.landmark[i].y = face_lms_flat[i*3+1]
            face_landmarks.landmark[i].z = face_lms_flat[i*3+2]
    else:
        face_landmarks = None

    return pose_landmarks, left_hand_landmarks, right_hand_landmarks, face_landmarks

# --- Main Visualization Logic ---
if __name__ == "__main__":
    if not os.path.exists(OUTPUT_RECORDINGS_DIR):
        print(f"Error: Directory '{OUTPUT_RECORDINGS_DIR}' not found.")
        exit()

    mp_drawing = mp.solutions.drawing_utils
    files = [f for f in os.listdir(OUTPUT_RECORDINGS_DIR) if f.endswith('.npy')]

    if not files:
        print("No .npy files found in the directory.")
        exit()

    for file_name in files:
        file_path = os.path.join(OUTPUT_RECORDINGS_DIR, file_name)
        gloss = file_name.split('_')[0].upper()
        
        try:
            landmarks_sequence = np.load(file_path)
            print(f"\n--- Loading and visualizing: {file_name} (Gloss: {gloss}) ---")
            print(f"Shape: {landmarks_sequence.shape}")

            for i, frame_landmarks in enumerate(landmarks_sequence):
                blank_frame = np.zeros((720, 1280, 3), dtype=np.uint8)
                pose_lms, lh_lms, rh_lms, face_lms = reconstruct_landmarks(frame_landmarks)

                if pose_lms:
                    mp_drawing.draw_landmarks(blank_frame, pose_lms, mp.solutions.holistic.POSE_CONNECTIONS)
                if lh_lms:
                    mp_drawing.draw_landmarks(blank_frame, lh_lms, mp.solutions.holistic.HAND_CONNECTIONS)
                if rh_lms:
                    mp_drawing.draw_landmarks(blank_frame, rh_lms, mp.solutions.holistic.HAND_CONNECTIONS)
                if face_lms:
                    mp_drawing.draw_landmarks(blank_frame, face_lms, mp.solutions.holistic.FACEMESH_CONTOURS)

                cv2.putText(blank_frame, f"File: {file_name}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2, cv2.LINE_AA)
                cv2.putText(blank_frame, f"Gloss: {gloss}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
                cv2.putText(blank_frame, f"Frame: {i+1}/{len(landmarks_sequence)}", (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)

                cv2.imshow('NPY File Visualizer', blank_frame)
                
                # Wait for a brief period to simulate playback speed
                key = cv2.waitKey(FRAME_DELAY_MS)
                if key == ord('q'):
                    break
            
            # Wait for user input before moving to the next file
            print("Press any key to continue to the next file...")
            cv2.waitKey(0)

        except Exception as e:
            print(f"Error loading or visualizing {file_name}: {e}")
            continue
    
    cv2.destroyAllWindows()
    print("\nVisualization complete.")