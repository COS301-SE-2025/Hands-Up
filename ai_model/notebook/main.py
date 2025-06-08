import cv2
import numpy as np
import os
import mediapipe as mp
from keyPoints import extract_keypoints
from utils import mediapipe_detection, draw_styled_landmarks

# Configuration
DATA_PATH = os.path.join('data')
actions = np.array(['hello', 'thanks', 'iloveyou'])
no_sequences = 30
sequence_length = 30
start_folder = 0  # Starting sequence number

def create_folders():
    """Creates all required folders from scratch"""
    os.makedirs(DATA_PATH, exist_ok=True)
    for action in actions:
        action_path = os.path.join(DATA_PATH, action)
        os.makedirs(action_path, exist_ok=True)
        for seq in range(start_folder, start_folder + no_sequences):
            seq_path = os.path.join(action_path, str(seq))
            os.makedirs(seq_path, exist_ok=True)

def main():
    create_folders()
    mp_holistic = mp.solutions.holistic
    cap = cv2.VideoCapture(0)
    
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        # Loop through actions
        for action in actions:
            # Loop through sequences
            for sequence in range(start_folder, start_folder + no_sequences):
                # Loop through frames in sequence
                for frame_num in range(sequence_length):
                    ret, frame = cap.read()
                    if not ret:
                        break
                        
                    image, results = mediapipe_detection(frame, holistic)
                    draw_styled_landmarks(image, results)
                    
                    # Display collection status
                    if frame_num == 0: 
                        cv2.putText(image, 'STARTING COLLECTION', (120, 200), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 4, cv2.LINE_AA)
                        cv2.putText(image, f'Collecting {action} Video {sequence}', (15, 12), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv2.LINE_AA)
                        cv2.imshow('OpenCV Feed', image)
                        cv2.waitKey(1000)  # Pause for 1 second at start
                    else: 
                        cv2.putText(image, f'Collecting {action} Video {sequence}', (15, 12), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv2.LINE_AA)
                        cv2.imshow('OpenCV Feed', image)
                    
                    # Save keypoints
                    keypoints = extract_keypoints(results)
                    npy_path = os.path.join(DATA_PATH, action, str(sequence), str(frame_num))
                    np.save(npy_path, keypoints)
                    
                    # Break if 'q' pressed
                    if cv2.waitKey(10) & 0xFF == ord('q'):
                        cap.release()
                        cv2.destroyAllWindows()
                        return
                        
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()