import os
import json
import cv2
import numpy as np
from mediapipe.python.solutions.holistic import Holistic
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from keyPoints import extract_keypoints  # Ensure this is defined properly

def read_sentence_mapping(path):
    with open(path, 'r') as f:
        mapping = json.load(f)
    return mapping

def get_label_from_file(filename, folder, mapping=None):
    name = os.path.splitext(filename)[0]
    if folder == "sentences" and mapping:
        return mapping.get(name)
    return None

def process_video(video_path, holistic, sequence_length):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[ERROR] Failed to open video: {video_path}")
        return []

    keypoints_sequence = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Convert to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = holistic.process(image)
        keypoints = extract_keypoints(results)
        keypoints_sequence.append(keypoints)

    cap.release()

    if len(keypoints_sequence) == 0:
        return []

    # Pad or trim to fixed length
    while len(keypoints_sequence) < sequence_length:
        keypoints_sequence.append(np.zeros_like(keypoints_sequence[0]))
    if len(keypoints_sequence) > sequence_length:
        keypoints_sequence = keypoints_sequence[:sequence_length]

    return keypoints_sequence

def load_data(data_path='dataset/ASL_Sign/sentences', mapping_path='dataset/mapping.txt'):
    # Load mapping
    with open(mapping_path, 'r') as f:
        mapping = json.load(f)

    X, y = [], []

    for fname in os.listdir(data_path):
        if fname.endswith('.mp4'):
            file_id = os.path.splitext(fname)[0]
            label = mapping.get(file_id)
            if not label:
                continue

            video_path = os.path.join(data_path, fname)
            frames = extract_frames(video_path)  # you define this
            X.append(frames)
            y.append(label)

    # Convert labels
    unique_labels = sorted(set(y))
    label_to_index = {label: i for i, label in enumerate(unique_labels)}
    y_encoded = [label_to_index[label] for label in y]
    y_one_hot = np.eye(len(unique_labels))[y_encoded]

    return train_test_split(np.array(X), np.array(y_one_hot), test_size=0.2), label_to_index
