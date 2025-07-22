import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split 
from tensorflow.keras.utils import to_categorical 
from tqdm import tqdm
import random 

# --- Configuration (match with previous steps) ---
PROCESSED_DATA_CSV = 'wlasl_10_words_combined_processed.csv' 
EXTRACTED_LANDMARKS_DIR = 'extracted_landmarks'
PROCESSED_SEQUENCES_DIR = 'processed_sequences'

SEQUENCE_LENGTH = 90 # Corrected based on duration analysis
EXPECTED_COORDS_PER_FRAME = 1662 

NUM_AUGMENTATIONS_PER_TRAIN_VIDEO = 5 # Increased augmentation multiplier
AUG_MAX_ROTATION_DEG = 10 
AUG_MAX_SCALE_FACTOR = 0.1 
AUG_MAX_JITTER_AMOUNT = 0.003 # Slightly reduced jitter

MAX_VIDEOS_FOR_TEST = None # Set to None to process the full subset


def normalize_landmarks(landmarks_sequence):
    """
    Normalizes a sequence of landmarks (frames, coords) to be translation and scale invariant.
    Handles single frames (ndim=1) or multiple frames (ndim=2).
    """
    if landmarks_sequence.size == 0:
        return landmarks_sequence.astype(np.float32)

    if landmarks_sequence.ndim == 1:
        input_is_single_frame = True
        landmarks_sequence_2d = np.expand_dims(landmarks_sequence, axis=0)
    else:
        input_is_single_frame = False
        landmarks_sequence_2d = landmarks_sequence

    NUM_POSE_COORDS_SINGLE = 33 * 4
    NUM_HAND_COORDS_SINGLE = 21 * 3
    NUM_FACE_COORDS_SINGLE = 468 * 3

    normalized_sequences = []
    for frame_landmarks in landmarks_sequence_2d:
        if np.all(frame_landmarks == 0):
            normalized_sequences.append(np.zeros(EXPECTED_COORDS_PER_FRAME, dtype=np.float32))
            continue 

        pose_coords_flat = frame_landmarks[0 : NUM_POSE_COORDS_SINGLE]
        left_hand_coords_flat = frame_landmarks[NUM_POSE_COORDS_SINGLE : NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE]
        right_hand_coords_flat = frame_landmarks[NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE : NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE]
        face_coords_flat = frame_landmarks[NUM_POSE_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE + NUM_HAND_COORDS_SINGLE : ]
        
        all_parts_data = [
            (pose_coords_flat, 4, [0.0] * NUM_POSE_COORDS_SINGLE),
            (left_hand_coords_flat, 3, [0.0] * NUM_HAND_COORDS_SINGLE),
            (right_hand_coords_flat, 3, [0.0] * NUM_HAND_COORDS_SINGLE),
            (face_coords_flat, 3, [0.0] * NUM_FACE_COORDS_SINGLE)
        ]
        
        normalized_frame_parts = []
        for flat_lms, coords_per_lm, original_padded_list_template in all_parts_data:
            if np.all(flat_lms == 0):
                normalized_frame_parts.append(np.array(original_padded_list_template, dtype=np.float32))
                continue
            
            lms_array = flat_lms.reshape(-1, coords_per_lm)
            coords_for_mean = lms_array[:, :3] if coords_per_lm == 4 else lms_array
            
            if np.all(coords_for_mean == 0):
                 normalized_frame_parts.append(np.array(original_padded_list_template, dtype=np.float32))
                 continue

            mean_coords = np.mean(coords_for_mean, axis=0)
            translated_lms = lms_array.copy()
            translated_lms[:, :3] -= mean_coords

            scale_factor = np.max(np.linalg.norm(translated_lms[:, :3], axis=1))
            if scale_factor > 1e-6:
                translated_lms[:, :3] /= scale_factor
            
            normalized_frame_parts.append(translated_lms.flatten())
            
        combined_normalized_frame = np.concatenate(normalized_frame_parts).astype(np.float32)
        
        if len(combined_normalized_frame) < EXPECTED_COORDS_PER_FRAME:
            combined_normalized_frame = np.pad(combined_normalized_frame, (0, EXPECTED_COORDS_PER_FRAME - len(combined_normalized_frame)), 'constant', constant_values=0.0)
        elif len(combined_normalized_frame) > EXPECTED_COORDS_PER_FRAME:
            combined_normalized_frame = combined_normalized_frame[:EXPECTED_COORDS_PER_FRAME]

        normalized_sequences.append(combined_normalized_frame)
            
    result_array = np.array(normalized_sequences, dtype=np.float32)
    
    if input_is_single_frame:
        return result_array[0] 
    else:
        return result_array 


def augment_sequence(sequence, max_rotation_deg, max_scale_factor, max_jitter_amount):
    """
    Applies random geometric augmentations to a landmark sequence.
    """
    augmented_sequence = sequence.copy()

    NUM_POSE_COORDS_SINGLE = 33 * 4
    NUM_HAND_COORDS_SINGLE = 21 * 3
    NUM_FACE_COORDS_SINGLE = 468 * 3

    # Generate random augmentation parameters
    angle_rad = np.deg2rad(np.random.uniform(-max_rotation_deg, max_rotation_deg))
    cos_val = np.cos(angle_rad)
    sin_val = np.sin(angle_rad)
    scale = np.random.uniform(1.0 - max_scale_factor, 1.0 + max_scale_factor)

    # 1. Apply rotation and scaling to each frame
    temp_sequence = []
    for frame_lms in augmented_sequence:
        processed_parts = []
        current_idx = 0

        # Process pose landmarks (33 points × 4 coords each)
        pose_lms = frame_lms[current_idx : current_idx + NUM_POSE_COORDS_SINGLE].reshape(-1, 4)
        current_idx += NUM_POSE_COORDS_SINGLE
        if pose_lms.size > 0 and not np.all(pose_lms[:,:3] == 0):
            # Apply rotation to x,y coordinates
            rotated_xy_pose = pose_lms[:, :2].dot(np.array([[cos_val, -sin_val], [sin_val, cos_val]]))
            pose_lms[:, :2] = rotated_xy_pose
            # Apply scaling to x,y,z coordinates
            pose_lms[:, :3] *= scale
        processed_parts.append(pose_lms.flatten())

        # Process left hand landmarks (21 points × 3 coords each)
        left_hand_lms = frame_lms[current_idx : current_idx + NUM_HAND_COORDS_SINGLE].reshape(-1, 3)
        current_idx += NUM_HAND_COORDS_SINGLE
        if left_hand_lms.size > 0 and not np.all(left_hand_lms == 0):
            # Apply rotation to x,y coordinates
            rotated_xy_lh = left_hand_lms[:, :2].dot(np.array([[cos_val, -sin_val], [sin_val, cos_val]]))
            left_hand_lms[:, :2] = rotated_xy_lh
            # Apply scaling to all coordinates
            left_hand_lms *= scale
        processed_parts.append(left_hand_lms.flatten())

        # Process right hand landmarks (21 points × 3 coords each)
        right_hand_lms = frame_lms[current_idx : current_idx + NUM_HAND_COORDS_SINGLE].reshape(-1, 3)
        current_idx += NUM_HAND_COORDS_SINGLE
        if right_hand_lms.size > 0 and not np.all(right_hand_lms == 0):
            # Apply rotation to x,y coordinates
            rotated_xy_rh = right_hand_lms[:, :2].dot(np.array([[cos_val, -sin_val], [sin_val, cos_val]]))
            right_hand_lms[:, :2] = rotated_xy_rh
            # Apply scaling to all coordinates
            right_hand_lms *= scale
        processed_parts.append(right_hand_lms.flatten())

        # Process face landmarks (468 points × 3 coords each)
        face_lms = frame_lms[current_idx : current_idx + NUM_FACE_COORDS_SINGLE].reshape(-1, 3)
        if face_lms.size > 0 and not np.all(face_lms == 0):
            # Apply rotation to x,y coordinates
            rotated_xy_face = face_lms[:, :2].dot(np.array([[cos_val, -sin_val], [sin_val, cos_val]]))
            face_lms[:, :2] = rotated_xy_face
            # Apply scaling to all coordinates
            face_lms *= scale
        processed_parts.append(face_lms.flatten())
        
        temp_sequence.append(np.concatenate(processed_parts))
    
    # Convert to numpy array
    augmented_sequence = np.array(temp_sequence, dtype=np.float32)

    # 2. Add random jitter (noise)
    jitter = np.random.normal(loc=0, scale=max_jitter_amount, size=augmented_sequence.shape)
    augmented_sequence += jitter

    return augmented_sequence


def _process_and_pad_sequence(raw_landmarks, output_dir, video_id, gloss, split):
    """Helper to normalize, pad/truncate and save a single sequence."""
    normalized_landmarks = normalize_landmarks(raw_landmarks)
    if normalized_landmarks is None or normalized_landmarks.size == 0:
        return None

    if normalized_landmarks.shape[0] < SEQUENCE_LENGTH:
        padding = np.zeros((SEQUENCE_LENGTH - normalized_landmarks.shape[0], EXPECTED_COORDS_PER_FRAME), dtype=np.float32)
        processed_sequence = np.vstack((normalized_landmarks, padding))
    elif normalized_landmarks.shape[0] > SEQUENCE_LENGTH:
        processed_sequence = normalized_landmarks[:SEQUENCE_LENGTH, :]
    else:
        processed_sequence = normalized_landmarks
    
    if processed_sequence.shape != (SEQUENCE_LENGTH, EXPECTED_COORDS_PER_FRAME):
        print(f"Error: Processed sequence for {video_id} has incorrect shape: {processed_sequence.shape}. Expected: ({SEQUENCE_LENGTH}, {EXPECTED_COORDS_PER_FRAME}). Skipping.")
        return None

    split_output_dir = os.path.join(output_dir, split if pd.notna(split) else 'unknown_split')
    os.makedirs(split_output_dir, exist_ok=True)
    
    output_filepath = os.path.join(split_output_dir, f"{video_id}.npy")
    np.save(output_filepath, processed_sequence)
    
    return {'video_id': video_id, 'gloss': gloss, 'split': split, 'processed_path': output_filepath}


if __name__ == "__main__":
    os.makedirs(PROCESSED_SEQUENCES_DIR, exist_ok=True)

    if not os.path.exists(PROCESSED_DATA_CSV):
        print(f"Error: Processed data CSV not found at {PROCESSED_DATA_CSV}. Please run wlasl_parser.py first to create it (for fixed list).")
        exit()
    
    df_base = pd.read_csv(PROCESSED_DATA_CSV)
    print(f"Loaded {len(df_base)} video entries from {PROCESSED_DATA_CSV}")

    unique_glosses = df_base['gloss'].unique()
    gloss_to_id = {gloss: i for i, gloss in enumerate(unique_glosses)}
    id_to_gloss = {i: gloss for i, gloss in enumerate(unique_glosses)}
    print(f"Created mapping for {len(unique_glosses)} unique glosses.")

    processed_data_records = []

    MAX_VIDEOS_FOR_TEST = None 

    df_to_process = df_base.head(MAX_VIDEOS_FOR_TEST) if MAX_VIDEOS_FOR_TEST is not None else df_base 

    print(f"\nProcessing {len(df_to_process)} videos for feature engineering, sequence preparation, and augmentation...")
    for index, row in tqdm(df_to_process.iterrows(), total=len(df_to_process), desc="Processing Sequences"):
        video_id = row['video_id']
        gloss = row['gloss']
        split = row['split']
        
        raw_landmarks_path = os.path.join(EXTRACTED_LANDMARKS_DIR, f"{video_id}.npy")
        if not os.path.exists(raw_landmarks_path):
            print(f"Warning: Raw landmark file not found for {video_id}. Skipping.")
            continue
        
        raw_landmarks = np.load(raw_landmarks_path)

        original_record = _process_and_pad_sequence(raw_landmarks, PROCESSED_SEQUENCES_DIR, video_id, gloss, split)
        if original_record:
            original_record['gloss_id'] = gloss_to_id[original_record['gloss']]
            processed_data_records.append(original_record)
        
        if split == 'train':
            for aug_idx in range(NUM_AUGMENTATIONS_PER_TRAIN_VIDEO):
                augmented_raw_landmarks = augment_sequence(
                    raw_landmarks.copy(), 
                    AUG_MAX_ROTATION_DEG, 
                    AUG_MAX_SCALE_FACTOR, 
                    AUG_MAX_JITTER_AMOUNT
                )
                
                aug_video_id = f"{video_id}_aug{aug_idx}"
                aug_record = _process_and_pad_sequence(augmented_raw_landmarks, PROCESSED_SEQUENCES_DIR, aug_video_id, gloss, split)
                if aug_record:
                    aug_record['gloss_id'] = gloss_to_id[aug_record['gloss']]
                    processed_data_records.append(aug_record)
            
    final_processed_df = pd.DataFrame(processed_data_records)
    print(f"\n--- Feature Engineering and Data Preparation Summary ---")
    print(f"Total processed sequences saved: {len(final_processed_df)}")
    print(f"Processed sequences saved to: {PROCESSED_SEQUENCES_DIR}")
    print(f"Final DataFrame for training/validation/test (including augmentations):\n{final_processed_df['split'].value_counts()}")

    final_processed_df.to_csv('wlasl_10_words_final_processed_data_augmented_seq90.csv', index=False)
    print("\nFinal processed data metadata saved to 'wlasl_10_words_final_processed_data_augmented_seq90.csv'")

    if not final_processed_df.empty:
        original_entries = final_processed_df[~final_processed_df['video_id'].astype(str).str.contains('_aug', na=False)]
        augmented_entries = final_processed_df[final_processed_df['video_id'].astype(str).str.contains('_aug', na=False)]

        original_example_entry = original_entries.iloc[0] if not original_entries.empty else None
        augmented_example_entry = augmented_entries.iloc[0] if not augmented_entries.empty else None

        if original_example_entry is not None:
            loaded_original = np.load(original_example_entry['processed_path'])
            print(f"\nSuccessfully loaded example ORIGINAL sequence: {original_example_entry['processed_path']}")
            print(f"Shape: {loaded_original.shape}. Expected: ({SEQUENCE_LENGTH}, {EXPECTED_COORDS_PER_FRAME})")
            print(f"First few values of first frame:\n{loaded_original[0, :10]}")

        if augmented_example_entry is not None:
            loaded_augmented = np.load(augmented_example_entry['processed_path'])
            print(f"\nSuccessfully loaded example AUGMENTED sequence: {augmented_example_entry['processed_path']}")
            print(f"Shape: {loaded_augmented.shape}. Expected: ({SEQUENCE_LENGTH}, {EXPECTED_COORDS_PER_FRAME})")
            print(f"First few values of first frame:\n{loaded_augmented[0, :10]}")
            
    else:
        print("\nNo processed sequences to test loading.")