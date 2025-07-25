import pandas as pd
import numpy as np
import os
import re # For regular expressions to parse filenames
from sklearn.model_selection import train_test_split # For splitting data

# --- Configuration ---
MY_RECORDED_SIGNS_DIR = 'my_recorded_signs'
PERSONAL_PROCESSED_CSV = 'wlasl_20_words_personal_processed.csv' # New CSV for personal data only

# --- Define your expected 20-word list (for validation, ensure only these glosses are included) ---
# This list MUST match the 20 words you used when recording your npy files
EXPECTED_GLOSSES = [
    "apple", "black", "blue", "brown", "can", "cat", "chair", "child", "cold", "come",
    "computer", "cow", "cry", "cup", "deaf", "dog", "drink", "drive", "eat", "egg"
]
EXPECTED_GLOSSES_SET = set(g.lower() for g in EXPECTED_GLOSSES)


print(f"--- Generating CSV from Personal Recordings Only ---")

personal_records = []
if os.path.exists(MY_RECORDED_SIGNS_DIR):
    print(f"Scanning for personal recordings in: {MY_RECORDED_SIGNS_DIR}")
    for filename in os.listdir(MY_RECORDED_SIGNS_DIR):
        if filename.lower().endswith('.npy'):
            # Filename format: 'gloss_timestamp.npy' or similar
            match = re.match(r'(.+?)_(\d+)\.npy', filename, re.IGNORECASE) # Added re.IGNORECASE
            if match:
                gloss = match.group(1).lower() # Extract gloss, ensure lowercase
                video_id_from_timestamp = match.group(2) # Use timestamp as a unique ID

                full_npy_path = os.path.join(MY_RECORDED_SIGNS_DIR, filename)

                if gloss in EXPECTED_GLOSSES_SET:
                    # We'll assign splits after loading all data
                    personal_records.append({
                        'gloss': gloss,
                        'video_id': f'personal_{video_id_from_timestamp}', # Prefix to differentiate
                        'video_path': full_npy_path, # Path to the NPY file itself
                        'signer_id': 'personal_user', # Consistent signer ID
                        'frame_start': 1, # Dummy values
                        'frame_end': -1,  # Dummy values (not used for NPY, but for compatibility)
                        'fps': 25,        # Assume 25 FPS for consistency
                        'bbox': [0,0,0,0], # Dummy bbox
                        'split': 'temp' # Temporary split, will be re-assigned
                    })
                else:
                    print(f"Warning: Personal recording '{filename}' has gloss '{gloss}' which is not in the EXPECTED_GLOSSES list. Skipping.")
            else:
                print(f"Warning: Could not parse filename for '{filename}'. Skipping.")
else:
    print(f"Error: Personal recordings directory '{MY_RECORDED_SIGNS_DIR}' not found. Exiting.")
    exit()

df_personal_raw = pd.DataFrame(personal_records)
print(f"Found {len(df_personal_raw)} personal recordings for the {len(EXPECTED_GLOSSES)} expected glosses.")

if df_personal_raw.empty:
    print("No valid personal recordings found matching the expected glosses. Cannot create CSV.")
    exit()

# --- Assign Train/Val/Test Splits to the Personal Data ---
# Group by gloss first to ensure all instances of a gloss are considered for splitting

# Determine the number of instances per gloss
gloss_counts = df_personal_raw['gloss'].value_counts()

# Adjust split ratios based on your total data quantity
# For 194 files (~19 per word), 70/15/15 is fine.
# If you have significantly more, e.g. 20-30 per word: train 80%, val 10%, test 10%

train_ratio = 0.70
val_ratio = 0.15
test_ratio = 0.15

df_personal_final = pd.DataFrame()
for gloss in EXPECTED_GLOSSES_SET:
    if gloss not in df_personal_raw['gloss'].unique():
        print(f"Warning: No personal recordings found for gloss '{gloss}'. This gloss will not be in the dataset.")
        continue

    gloss_df = df_personal_raw[df_personal_raw['gloss'] == gloss].copy()

    # Ensure enough samples for all splits
    if len(gloss_df) < 3: # Need at least 3 for a minimal split
        print(f"Warning: Gloss '{gloss}' has only {len(gloss_df)} instances. Adding all to train.")
        gloss_df['split'] = 'train'
        df_personal_final = pd.concat([df_personal_final, gloss_df])
        continue

    # Split into train/test first
    train_val_df, test_df = train_test_split(
        gloss_df, test_size=test_ratio, random_state=42, stratify=gloss_df['gloss']
    )
    # Split train_val into train/val
    # Adjust val_size ratio for the remaining train_val_df
    remaining_val_ratio = val_ratio / (train_ratio + val_ratio) # e.g., 0.15 / (0.7 + 0.15) = 0.15 / 0.85 = 0.176
    train_df, val_df = train_test_split(
        train_val_df, test_size=remaining_val_ratio, random_state=42, stratify=train_val_df['gloss']
    )

    train_df['split'] = 'train'
    val_df['split'] = 'val'
    test_df['split'] = 'test'

    df_personal_final = pd.concat([df_personal_final, train_df, val_df, test_df])

# Re-map gloss_ids to be sequential (0 to N-1) for the final set of classes
# This is CRITICAL for the model's output layer
final_unique_glosses_in_dataset = df_personal_final['gloss'].unique()
final_gloss_to_id = {g: i for i, g in enumerate(final_unique_glosses_in_dataset)}
df_personal_final['gloss_id'] = df_personal_final['gloss'].map(final_gloss_to_id)

print(f"\n--- Personal Dataset Summary ---")
print(f"Total instances in final dataset: {len(df_personal_final)}")
print(f"Unique glosses: {df_personal_final['gloss'].nunique()} (Out of {len(EXPECTED_GLOSSES)} requested)")
print(f"Distribution of splits:\n{df_personal_final['split'].value_counts()}")

df_personal_final.to_csv(PERSONAL_PROCESSED_CSV, index=False)
print(f"\nPersonal dataset metadata saved to '{PERSONAL_PROCESSED_CSV}'")