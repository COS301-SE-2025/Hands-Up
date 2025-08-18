import numpy as np
import pandas as pd
import os
from tensorflow.keras.models import load_model

MODEL_PATH = '../../saved_models/best_sign_classifier_model_125_words_seq90.keras'
CSV_PATH = '../../data/wlasl_125_words_personal_final_processed_data_augmented_seq90.csv'

SEQUENCE_LENGTH = 90
FEATURE_DIM = 1662
CONFIDENCE_THRESHOLD = 0.50

model = load_model(MODEL_PATH)
df = pd.read_csv(CSV_PATH)
id_to_gloss = {i: g for i, g in enumerate(df['gloss'].unique())}

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

    sequence = np.array(sequence_frames, dtype=np.float32)
    sequence = pad_or_truncate(sequence, SEQUENCE_LENGTH, FEATURE_DIM)
    sequence = np.expand_dims(sequence, axis=0)

    preds = model.predict(sequence, verbose=0)
    class_id = int(np.argmax(preds))
    confidence = float(np.max(preds))
    word = id_to_gloss.get(class_id, "Unknown")

    if confidence >= CONFIDENCE_THRESHOLD:
        return {"word": word, "confidence": confidence}
    else:
        return {"word": "", "confidence": confidence}
