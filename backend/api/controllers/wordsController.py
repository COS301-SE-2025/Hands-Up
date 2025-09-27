import cv2
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import mediapipe as mp

MODEL_PATH = '../../ai_model/words/saved_models/best_sign_classifier_model_125_words_seq90.keras'
CSV_PATH = '../../ai_model/words/wlasl_125_words_personal_final_processed_data_augmented_seq90.csv'
SEQUENCE_LENGTH = 90
EXPECTED_COORDS_PER_FRAME = 1662
CONFIDENCE_THRESHOLD = 0.1

model = load_model(MODEL_PATH)
df = pd.read_csv(CSV_PATH)
unique_glosses = df['gloss'].unique()
id_to_gloss = {i: g for i, g in enumerate(unique_glosses)}

mp_holistic = mp.solutions.holistic.Holistic(
    static_image_mode=True,
    model_complexity=1,
    min_detection_confidence=0.2,
    min_tracking_confidence=0.5
)

NUM_POSE_COORDS_SINGLE = 33*4
NUM_HAND_COORDS_SINGLE = 21*3
NUM_FACE_COORDS_SINGLE = 468*3

def normalize_landmarks(landmarks_sequence):
    if landmarks_sequence.ndim == 1:
        landmarks_sequence = np.expand_dims(landmarks_sequence, axis=0)

    normalized_sequences = []
    for frame_landmarks in landmarks_sequence:
        if np.all(frame_landmarks == 0):
            normalized_sequences.append(np.zeros(EXPECTED_COORDS_PER_FRAME, dtype=np.float32))
            continue

        pose_coords_flat = frame_landmarks[0 : NUM_POSE_COORDS_SINGLE]
        left_hand_coords_flat = frame_landmarks[NUM_POSE_COORDS_SINGLE : NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE]
        right_hand_coords_flat = frame_landmarks[NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE : NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE*2]
        face_coords_flat = frame_landmarks[NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE*2 : ]

        all_parts_data = [
            (pose_coords_flat, 4, [0.0]*NUM_POSE_COORDS_SINGLE),
            (left_hand_coords_flat, 3, [0.0]*NUM_HAND_COORDS_SINGLE),
            (right_hand_coords_flat, 3, [0.0]*NUM_HAND_COORDS_SINGLE),
            (face_coords_flat, 3, [0.0]*NUM_FACE_COORDS_SINGLE)
        ]

        normalized_frame_parts = []
        for flat_lms, coords_per_lm, template in all_parts_data:
            if np.all(flat_lms == 0):
                normalized_frame_parts.append(np.array(template, dtype=np.float32))
                continue

            lms_array = flat_lms.reshape(-1, coords_per_lm)
            coords_for_mean = lms_array[:, :3] if coords_per_lm == 4 else lms_array
            mean_coords = np.mean(coords_for_mean, axis=0)
            translated_lms = lms_array.copy()
            translated_lms[:, :3] -= mean_coords
            scale_factor = np.max(np.linalg.norm(translated_lms[:, :3], axis=1))
            if scale_factor > 1e-6:
                translated_lms[:, :3] /= scale_factor
            normalized_frame_parts.append(translated_lms.flatten())

        combined_frame = np.concatenate(normalized_frame_parts).astype(np.float32)
        if len(combined_frame) < EXPECTED_COORDS_PER_FRAME:
            combined_frame = np.pad(combined_frame, (0, EXPECTED_COORDS_PER_FRAME - len(combined_frame)), 'constant')
        elif len(combined_frame) > EXPECTED_COORDS_PER_FRAME:
            combined_frame = combined_frame[:EXPECTED_COORDS_PER_FRAME]

        normalized_sequences.append(combined_frame)

    return np.array(normalized_sequences, dtype=np.float32)

def pad_or_truncate_sequence(sequence, target_length, feature_dimension):
    if sequence.shape[0] < target_length:
        padding = np.zeros((target_length - sequence.shape[0], feature_dimension), dtype=np.float32)
        return np.vstack((sequence, padding))
    return sequence[:target_length, :]

def detect_from_image_bytes(sequence_bytes_list, dexterity='right'):
    sequence = []

    for idx, image_bytes in enumerate(sequence_bytes_list):
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            print(f"Warning: Could not decode image bytes at index {idx}")
            sequence.append(np.zeros(EXPECTED_COORDS_PER_FRAME, dtype=np.float32))
            continue

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mp_results = mp_holistic.process(img_rgb)

        frame_lms = np.zeros(EXPECTED_COORDS_PER_FRAME, dtype=np.float32)
        current_idx = 0

        if mp_results.pose_landmarks:
            pose_flat = [coord for lm in mp_results.pose_landmarks.landmark for coord in [lm.x, lm.y, lm.z, lm.visibility]]
            frame_lms[current_idx:current_idx + len(pose_flat)] = pose_flat
        else:
            print(f"Warning: No pose landmarks detected in frame {idx}")
        current_idx += NUM_POSE_COORDS_SINGLE

        dominant_hand = 'right_hand_landmarks' if dexterity == 'right' else 'left_hand_landmarks'
        non_dominant_hand = 'left_hand_landmarks' if dexterity == 'right' else 'right_hand_landmarks'

        if getattr(mp_results, dominant_hand):
            hand_flat = [coord for lm in getattr(mp_results, dominant_hand).landmark for coord in [lm.x, lm.y, lm.z]]
            frame_lms[current_idx:current_idx + len(hand_flat)] = hand_flat
        else:
            print(f"Warning: No dominant hand ({dexterity}) landmarks detected in frame {idx}")
        current_idx += NUM_HAND_COORDS_SINGLE

        if getattr(mp_results, non_dominant_hand):
            hand_flat = [coord for lm in getattr(mp_results, non_dominant_hand).landmark for coord in [lm.x, lm.y, lm.z]]
            frame_lms[current_idx:current_idx + len(hand_flat)] = hand_flat
        else:
            print(f"Warning: No non-dominant hand landmarks detected in frame {idx}")
        current_idx += NUM_HAND_COORDS_SINGLE

        if mp_results.face_landmarks:
            face_flat = [coord for lm in mp_results.face_landmarks.landmark for coord in [lm.x, lm.y, lm.z]]
            frame_lms[current_idx:current_idx + len(face_flat)] = face_flat
        else:
            print(f"Warning: No face landmarks detected in frame {idx}")

        sequence.append(frame_lms)

    if not sequence:
        return {"word": "", "confidence": 0.0}

    sequence = normalize_landmarks(np.array(sequence, dtype=np.float32))
    sequence = pad_or_truncate_sequence(sequence, SEQUENCE_LENGTH, EXPECTED_COORDS_PER_FRAME)
    sequence = np.expand_dims(sequence, axis=0)

    preds = model.predict(sequence, verbose=0)
    predicted_id = int(np.argmax(preds))
    confidence = float(np.max(preds))
    predicted_word = id_to_gloss.get(predicted_id, "Unknown")

    result = {"word": predicted_word if confidence >= CONFIDENCE_THRESHOLD else "",
              "confidence": confidence}
    
    print(f"Prediction result: {result}")
    return result