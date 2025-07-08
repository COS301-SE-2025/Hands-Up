import cv2
import mediapipe as mp
import pandas as pd
import numpy as np
import os
from tqdm import tqdm # For progress bars

# --- Configuration ---
# Path to your processed WLASL NSLT-100 CSV
PROCESSED_DATA_CSV = 'wlasl_nslt_100_processed.csv'
# Directory to save extracted landmark data
OUTPUT_LANDMARKS_DIR = 'extracted_landmarks'
# Whether to visualize the landmarks during extraction (set to False for faster processing)
VISUALIZE_LANDMARKS = False
# Max videos to process for quick test (set to None to process all from CSV)
MAX_VIDEOS_FOR_TEST = None # Start with a small number to test

# --- Define the expected number of coordinates for each type of landmark (MOVED TO GLOBAL SCOPE) ---
# These are based on MediaPipe's output structure
NUM_POSE_COORDS = 33 * 4  # 33 landmarks * (x, y, z, visibility)
NUM_HAND_COORDS = 21 * 3  # 21 landmarks * (x, y, z)
NUM_FACE_COORDS = 468 * 3 # 468 landmarks * (x, y, z) - approximate, actual can be slightly less if not all are visible/estimated


def extract_landmarks_from_video(video_path, mp_holistic_instance):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return None

    frame_landmarks_list = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break # End of video or error reading frame

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False

        results = mp_holistic_instance.process(image)

        if VISUALIZE_LANDMARKS:
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            mp.solutions.drawing_utils.draw_landmarks(
                image, results.pose_landmarks, mp.solutions.holistic.POSE_CONNECTIONS,
                mp.solutions.drawing_utils.DrawingSpec(color=(80,22,10), thickness=2, circle_radius=4),
                mp.solutions.drawing_utils.DrawingSpec(color=(80,44,121), thickness=2, circle_radius=2)
            )
            mp.solutions.drawing_utils.draw_landmarks(
                image, results.left_hand_landmarks, mp.solutions.holistic.HAND_CONNECTIONS,
                mp.solutions.drawing_utils.DrawingSpec(color=(121,22,76), thickness=2, circle_radius=4),
                mp.solutions.drawing_utils.DrawingSpec(color=(121,44,250), thickness=2, circle_radius=2)
            )
            mp.solutions.drawing_utils.draw_landmarks(
                image, results.right_hand_landmarks, mp.solutions.holistic.HAND_CONNECTIONS,
                mp.solutions.drawing_utils.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=4),
                mp.solutions.drawing_utils.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
            )
            mp.solutions.drawing_utils.draw_landmarks(
                image, results.face_landmarks, mp.solutions.holistic.FACEMESH_CONTOURS, # Changed to FACEMESH_CONTOURS for potentially better rendering
                mp.solutions.drawing_utils.DrawingSpec(color=(80,110,10), thickness=1, circle_radius=1),
                mp.solutions.drawing_utils.DrawingSpec(color=(80,256,121), thickness=1, circle_radius=1)
            )
            
            cv2.imshow('MediaPipe Landmarks', image)
            if cv2.waitKey(1) & 0xFF == 27: # Press 'ESC' to exit visualization
                break

        # --- Store Landmarks ---
        # Initialize all landmark lists to zeros of their expected full size
        pose_coords = [0.0] * NUM_POSE_COORDS
        left_hand_coords = [0.0] * NUM_HAND_COORDS
        right_hand_coords = [0.0] * NUM_HAND_COORDS
        face_coords = [0.0] * NUM_FACE_COORDS

        # Populate if landmarks are detected
        if results.pose_landmarks:
            current_pose_coords = []
            for landmark in results.pose_landmarks.landmark:
                current_pose_coords.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])
            pose_coords[:len(current_pose_coords)] = current_pose_coords
        
        if results.left_hand_landmarks:
            current_left_hand_coords = []
            for landmark in results.left_hand_landmarks.landmark:
                current_left_hand_coords.extend([landmark.x, landmark.y, landmark.z])
            left_hand_coords[:len(current_left_hand_coords)] = current_left_hand_coords

        if results.right_hand_landmarks:
            current_right_hand_coords = []
            for landmark in results.right_hand_landmarks.landmark:
                current_right_hand_coords.extend([landmark.x, landmark.y, landmark.z])
            right_hand_coords[:len(current_right_hand_coords)] = current_right_hand_coords

        if results.face_landmarks:
            current_face_coords = []
            for landmark in results.face_landmarks.landmark:
                current_face_coords.extend([landmark.x, landmark.y, landmark.z])
            face_coords[:len(current_face_coords)] = current_face_coords


        frame_combined_landmarks = np.array(
            pose_coords + left_hand_coords + right_hand_coords + face_coords, 
            dtype=np.float32
        ).flatten()
        
        frame_landmarks_list.append(frame_combined_landmarks)

    cap.release()
    if VISUALIZE_LANDMARKS:
        cv2.destroyAllWindows()
    
    if frame_landmarks_list:
        return np.array(frame_landmarks_list, dtype=np.float32)
    else:
        return None


if __name__ == "__main__":
    os.makedirs(OUTPUT_LANDMARKS_DIR, exist_ok=True)

    if not os.path.exists(PROCESSED_DATA_CSV):
        print(f"Error: Processed data CSV not found at {PROCESSED_DATA_CSV}. Please run wlasl_parser.py first.")
        exit()
    
    df_nslt_100 = pd.read_csv(PROCESSED_DATA_CSV)
    print(f"Loaded {len(df_nslt_100)} video entries from {PROCESSED_DATA_CSV}")

    mp_holistic = mp.solutions.holistic.Holistic(
        static_image_mode=False,
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    processed_count = 0
    skipped_count = 0

    for index, row in tqdm(df_nslt_100.iterrows(), total=len(df_nslt_100), desc="Extracting Landmarks"):
        if MAX_VIDEOS_FOR_TEST is not None and processed_count >= MAX_VIDEOS_FOR_TEST:
            print(f"Stopping after {MAX_VIDEOS_FOR_TEST} videos for testing.")
            break

        video_path = row['video_path']
        video_id = row['video_id']
        gloss = row['gloss']

        output_npy_filename = f"{video_id}.npy"
        output_npy_path = os.path.join(OUTPUT_LANDMARKS_DIR, output_npy_filename)

        if os.path.exists(output_npy_path):
            processed_count += 1
            continue

        landmarks_data = extract_landmarks_from_video(video_path, mp_holistic)

        if landmarks_data is not None and landmarks_data.shape[0] > 0:
            np.save(output_npy_path, landmarks_data)
            processed_count += 1
        else:
            print(f"Warning: No valid landmarks extracted for {video_path}. Skipping.")
            skipped_count += 1

    mp_holistic.close()
    print(f"\n--- Landmark Extraction Summary ---")
    print(f"Total videos processed: {processed_count}")
    print(f"Total videos skipped (e.g., no landmarks, already processed): {skipped_count}")
    print(f"Landmark data saved to: {OUTPUT_LANDMARKS_DIR}")

    # --- Test a saved landmark file ---
    if processed_count > 0:
        example_video_id = None
        for _, row in df_nslt_100.iterrows():
            temp_output_npy_path = os.path.join(OUTPUT_LANDMARKS_DIR, f"{row['video_id']}.npy")
            if os.path.exists(temp_output_npy_path):
                example_video_id = row['video_id']
                break
        
        if example_video_id:
            example_npy_path = os.path.join(OUTPUT_LANDMARKS_DIR, f"{example_video_id}.npy")
            loaded_landmarks = np.load(example_npy_path)
            print(f"\nSuccessfully loaded example landmark file: {example_npy_path}")
            print(f"Shape of loaded landmarks (frames, total_coords): {loaded_landmarks.shape}")
            print(f"First few values of the first frame's landmarks:\n{loaded_landmarks[0, :10]}")
            
            # These variables are now globally accessible
            expected_total_coords = NUM_POSE_COORDS + NUM_HAND_COORDS + NUM_HAND_COORDS + NUM_FACE_COORDS
            print(f"Expected total coordinates per frame: {expected_total_coords}")
            if loaded_landmarks.shape[1] != expected_total_coords:
                print(f"WARNING: Loaded landmark dimension {loaded_landmarks.shape[1]} does not match expected {expected_total_coords}.")

        else:
            print("\nNo videos were processed to test landmark saving, or no .npy files were found in the output directory.")
    else:
        print("\nNo videos were processed to test landmark saving.")