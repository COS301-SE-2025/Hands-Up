import numpy as np
import pandas as pd
import os
import time
from tensorflow.keras.models import load_model

# --- Configuration ---
MODEL_PATH = 'saved_models/best_sign_classifier_model_125_words_seq90.keras'
PROCESSED_DATA_CSV = 'wlasl_125_words_personal_final_processed_data_augmented_seq90.csv'

SEQUENCE_LENGTH = 90
EXPECTED_COORDS_PER_FRAME = 1662

NUM_POSE_COORDS_SINGLE = 33 * 4
NUM_HAND_COORDS_SINGLE = 21 * 3
NUM_FACE_COORDS_SINGLE = 468 * 3

CONFIDENCE_THRESHOLD = 0.50

# --- Utility Functions ---
def normalize_landmarks(landmarks_sequence):
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
        right_hand_coords_flat = frame_landmarks[NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE : NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE*2]
        face_coords_flat = frame_landmarks[NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE*2 : ]

        all_parts_data = [
            (pose_coords_flat, 4, [0.0] * NUM_POSE_COORDS_SINGLE),
            (left_hand_coords_flat, 3, [0.0] * NUM_HAND_COORDS_SINGLE),
            (right_hand_coords_flat, 3, [0.0] * NUM_HAND_COORDS_SINGLE),
            (face_coords_flat, 3, [0.0] * NUM_FACE_COORDS_SINGLE)
        ]

        normalized_frame_parts = []
        for flat_lms, coords_per_lm, template in all_parts_data:
            if np.all(flat_lms == 0):
                normalized_frame_parts.append(np.array(template, dtype=np.float32))
                continue

            lms_array = flat_lms.reshape(-1, coords_per_lm)
            coords_for_mean = lms_array[:, :3] if coords_per_lm == 4 else lms_array

            if np.all(coords_for_mean == 0):
                normalized_frame_parts.append(np.array(template, dtype=np.float32))
                continue

            mean_coords = np.mean(coords_for_mean, axis=0)
            translated_lms = lms_array.copy()
            translated_lms[:, :3] -= mean_coords

            scale_factor = np.max(np.linalg.norm(translated_lms[:, :3], axis=1))
            if scale_factor > 1e-6:
                translated_lms[:, :3] /= scale_factor

            normalized_frame_parts.append(translated_lms.flatten())

        combined = np.concatenate(normalized_frame_parts).astype(np.float32)

        if len(combined) < EXPECTED_COORDS_PER_FRAME:
            combined = np.pad(combined, (0, EXPECTED_COORDS_PER_FRAME - len(combined)), 'constant', constant_values=0.0)
        elif len(combined) > EXPECTED_COORDS_PER_FRAME:
            combined = combined[:EXPECTED_COORDS_PER_FRAME]

        normalized_sequences.append(combined)

    result_array = np.array(normalized_sequences, dtype=np.float32)
    return result_array[0] if input_is_single_frame else result_array

def pad_or_truncate_sequence(sequence, target_length, feature_dimension):
    if sequence.shape[0] < target_length:
        padding = np.zeros((target_length - sequence.shape[0], feature_dimension), dtype=np.float32)
        return np.vstack((sequence, padding))
    elif sequence.shape[0] > target_length:
        return sequence[:target_length, :]
    return sequence

# --- Load Model & Labels ---
def load_sign_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

    model = load_model(MODEL_PATH)

    if not os.path.exists(PROCESSED_DATA_CSV):
        raise FileNotFoundError(f"CSV not found at {PROCESSED_DATA_CSV}")

    df_final = pd.read_csv(PROCESSED_DATA_CSV)
    unique_glosses = df_final['gloss'].unique()
    id_to_gloss = {i: gloss for i, gloss in enumerate(unique_glosses)}
    return model, id_to_gloss

# --- Inference Function ---
def detect_from_landmarks(sequence_frames, model=None, id_to_gloss=None):
    """
    sequence_frames: list or np.ndarray of shape (num_frames, EXPECTED_COORDS_PER_FRAME)
        Each element should be a flattened landmark frame.

    Returns: dict with { 'word': str, 'confidence': float }
    """
    if model is None or id_to_gloss is None:
        model, id_to_gloss = load_sign_model()

    if len(sequence_frames) == 0:
        return {"word": "", "confidence": 0.0}

    processed_sequence = normalize_landmarks(np.array(sequence_frames))
    final_input_sequence = pad_or_truncate_sequence(processed_sequence, SEQUENCE_LENGTH, EXPECTED_COORDS_PER_FRAME)
    final_input_sequence = np.expand_dims(final_input_sequence, axis=0)

    predictions = model.predict(final_input_sequence, verbose=0)
    predicted_class_id = np.argmax(predictions)
    prediction_confidence = float(predictions[0, predicted_class_id])
    predicted_gloss = id_to_gloss.get(predicted_class_id, "Unknown")

    if prediction_confidence >= CONFIDENCE_THRESHOLD:
        return {"word": predicted_gloss, "confidence": prediction_confidence}
    else:
        return {"word": "", "confidence": prediction_confidence}
