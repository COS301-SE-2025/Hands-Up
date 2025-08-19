import os
import cv2
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import mediapipe as mp

MODEL_PATH = '../../translate/saved_models/best_sign_classifier_model_125_words_seq90.keras'
CSV_PATH = '../../translate/wlasl_125_words_personal_final_processed_data_augmented_seq90.csv'
SEQUENCE_LENGTH = 90
FEATURE_DIM = 1662
CONFIDENCE_THRESHOLD = 0.50

# Load model & labels
model = load_model(MODEL_PATH)
df = pd.read_csv(CSV_PATH)
id_to_gloss = {i: g for i, g in enumerate(df['gloss'].unique())}

# MediaPipe setups
mp_hands = mp.solutions.hands.Hands(static_image_mode=True)
mp_face = mp.solutions.face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=False,  
    min_detection_confidence=0.5
)
mp_pose = mp.solutions.pose.Pose(static_image_mode=True)
mp_drawing = mp.solutions.drawing_utils

def extract_landmarks_from_images(image_paths):
    sequence = []

    for path in image_paths:
        img = cv2.imread(path)
        if img is None:
            continue

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        hand_results = mp_hands.process(img_rgb)
        face_results = mp_face.process(img_rgb)
        pose_results = mp_pose.process(img_rgb)

        if hand_results.multi_hand_landmarks:
            for handLms in hand_results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(img_rgb, handLms, mp.solutions.hands.HAND_CONNECTIONS)
        if face_results.multi_face_landmarks:
            for faceLms in face_results.multi_face_landmarks:
                mp_drawing.draw_landmarks(img_rgb, faceLms, mp.solutions.face_mesh.FACEMESH_CONTOURS)
        if pose_results.pose_landmarks:
            mp_drawing.draw_landmarks(img_rgb, pose_results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)

        coords = []

        # Hands (21 * 3 = 63)
        if hand_results.multi_hand_landmarks:
            handLms = hand_results.multi_hand_landmarks[0]
            for lm in handLms.landmark:
                coords.extend([lm.x, lm.y, lm.z])
        else:
            coords.extend([0]*63)

        # Face (468 * 3 = 1404)
        # if face_results.multi_face_landmarks:
        #     faceLms = face_results.multi_face_landmarks[0]
        #     for lm in faceLms.landmark:
        #         coords.extend([lm.x, lm.y, lm.z])
        # else:
        #     coords.extend([0]*1404)

        # # Pose (33 * 3 = 99)
        # if pose_results.pose_landmarks:
        #     for lm in pose_results.pose_landmarks.landmark:
        #         coords.extend([lm.x, lm.y, lm.z])
        # else:
        #     coords.extend([0]*99)

        # if len(coords) < FEATURE_DIM:
        #     coords.extend([0]*(FEATURE_DIM - len(coords)))
        # elif len(coords) > FEATURE_DIM:
        #     coords = coords[:FEATURE_DIM]

        sequence.append(coords)

    return np.array(sequence, dtype=np.float32)

def pad_or_truncate(sequence, target_length, feature_dim):
    if sequence.shape[0] < target_length:
        padding = np.zeros((target_length - sequence.shape[0], feature_dim), dtype=np.float32)
        return np.vstack((sequence, padding))
    elif sequence.shape[0] > target_length:
        return sequence[:target_length, :]
    return sequence

def detectWords(sequence_frames):
    if len(sequence_frames) == 0:
        return {"word": "", "confidence": 0.0}

    sequence = extract_landmarks_from_images(sequence_frames)
    sequence = pad_or_truncate(sequence, SEQUENCE_LENGTH, FEATURE_DIM)
    sequence = np.expand_dims(sequence, axis=0)

    preds = model.predict(sequence, verbose=0)
    class_id = int(np.argmax(preds))
    confidence = float(np.max(preds))
    word = id_to_gloss.get(class_id, "Unknown")

    if confidence >= CONFIDENCE_THRESHOLD:
        print(f"Detected word: {word} at {confidence}")
        return {"word": word, "confidence": confidence}
    else:
        print(f"Detected word: {word} at {confidence}")
        return {"word": "", "confidence": confidence}


