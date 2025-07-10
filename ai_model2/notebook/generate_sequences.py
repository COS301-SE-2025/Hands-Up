import cv2
import os
import numpy as np
import mediapipe as mp
from keyPoints import extract_keypoints

# Mediapipe setup
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# Parameters
SEQUENCE_LENGTH = 30
DATASET_PATH = 'dataset'
OUTPUT_PATH = 'processed_dataset'

if not os.path.exists(OUTPUT_PATH):
    os.makedirs(OUTPUT_PATH)

print("Starting data preprocessing...")

# Go through each action folder
for action in os.listdir(DATASET_PATH):
    action_path = os.path.join(DATASET_PATH, action)
    if not os.path.isdir(action_path):
        continue

    output_action_path = os.path.join(OUTPUT_PATH, action)
    os.makedirs(output_action_path, exist_ok=True)
    
    print(f"Processing action: {action}")
    
    for video_name in os.listdir(action_path):
        if not video_name.endswith(('.mp4', '.avi', '.mov')):
            continue

        cap = cv2.VideoCapture(os.path.join(action_path, video_name))
        sequence = []
        
        with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
            frame_count = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                results = holistic.process(image)

                keypoints = extract_keypoints(results)
                
                # DEBUG: Check if keypoints are extracted properly
                if len(keypoints) == 0 or np.all(keypoints == 0):
                    print(f"WARNING: No keypoints detected in frame {frame_count} of {video_name}")
                
                sequence.append(keypoints)
                frame_count += 1

                if frame_count == SEQUENCE_LENGTH:
                    break

        cap.release()

        if len(sequence) == SEQUENCE_LENGTH:
            sequence_np = np.array(sequence)
            
            # DEBUG: Check sequence statistics
            print(f"Sequence shape: {sequence_np.shape}")
            print(f"Sequence min/max: {sequence_np.min():.4f}/{sequence_np.max():.4f}")
            print(f"Sequence mean: {sequence_np.mean():.4f}")
            
            save_name = os.path.splitext(video_name)[0] + ".npy"
            save_path = os.path.join(output_action_path, save_name)
            np.save(save_path, sequence_np)
            print(f"✅ Saved: {save_path}")
        else:
            print(f"⛔ Skipped {video_name} — only {len(sequence)} frames")

print("✅ Data preprocessing completed.")