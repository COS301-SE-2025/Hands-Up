import pandas as pd
import numpy as np
import os
import re # For regular expressions to parse filenames
from sklearn.model_selection import train_test_split # For splitting data

# --- Configuration ---
MY_RECORDED_SIGNS_DIR = 'my_recorded_signs'
PERSONAL_PROCESSED_CSV = 'wlasl_77_words_demo_processed.csv' # <-- CHANGED: New CSV for the final 77-word demo set

# --- Define your expected 77-word list (for validation, ensure only these glosses are included) ---
# This list MUST match the 77 glosses confirmed to be in your my_recorded_signs folder
EXPECTED_GLOSSES = [
    # 60 Working Words + Fixed:
    "red", "yellow", "purple", "brown", "grey", "gold", "black", "you", "your", "what", 
    "hello", "again", "nice", "meet", "boy", "parents", "child", "aunt", "cry", "hurt", 
    "sad", "love", "drive", "sleep", "stand", "come", "stay", "can", "tomorrow", "today", 
    "future", "monday", "tuesday", "wednesday", "sunday", "year", "yesterday", 
    "water", "apple", "drink", "pizza", "eat", "cup", "shower", "light", "computer", 
    "hate", "chair", "car", "ambulance", "cow", "bird", "cat", "dog", "autum", 
    "summer", "spring", "cold", "rain", "freeze", "sunrise", "wind", "weather", 
    "go", "drive-there", 
    # 17 Words Added/Restored for Demo Script:
    "my", "name", "this", "our", "i", "university", "student", "translation", "real", 
    "time", "try", "end", "demonstration", "with", "force",
    # 8 Restored Words
    "am", "and", "give", "hot", "mother", "sun", "uncle", "work"
]
EXPECTED_GLOSSES_SET = set(g.lower() for g in EXPECTED_GLOSSES)


print(f"--- Generating CSV from Personal Recordings Only ---")

personal_records = []
if os.path.exists(MY_RECORDED_SIGNS_DIR):
    print(f"Scanning for personal recordings in: {MY_RECORDED_SIGNS_DIR}")
    for filename in os.listdir(MY_RECORDED_SIGNS_DIR):
        if filename.lower().endswith('.npy'):
            # Filename format: 'gloss_timestamp.npy' or similar
            match = re.match(r'(.+?)_(\d+)\.npy', filename, re.IGNORECASE)
            if match:
                gloss = match.group(1).lower() # Extract gloss, ensure lowercase
                video_id_from_timestamp = match.group(2) # Use timestamp as a unique ID

                full_npy_path = os.path.join(MY_RECORDED_SIGNS_DIR, filename)

                # Only process files whose gloss is in the FINAL 77-word list
                if gloss in EXPECTED_GLOSSES_SET:
                    personal_records.append({
                        'gloss': gloss,
                        'video_id': f'personal_{video_id_from_timestamp}',
                        'video_path': full_npy_path, # Path to the NPY file itself
                        'signer_id': 'personal_user',
                        'frame_start': 1,
                        'frame_end': -1,
                        'fps': 25,
                        'bbox': [0,0,0,0],
                        'split': 'temp' # Temporary split, will be re-assigned
                    })
                # We skip files not in the 77-word list, completing the cleanup
                # else:
                #     print(f"Warning: Recording '{filename}' skipped (not in final 77-word list).")
            else:
                print(f"Warning: Could not parse filename for '{filename}'. Skipping.")
else:
    print(f"Error: Personal recordings directory '{MY_RECORDED_SIGNS_DIR}' not found. Exiting.")
    exit()

df_personal_raw = pd.DataFrame(personal_records)
# Note: The expected gloss count is 77, but the script still uses the old variable definition length
# This print statement will correctly show the intended size:
print(f"Found {len(df_personal_raw)} personal recordings for the {len(EXPECTED_GLOSSES)} expected glosses.")

if df_personal_raw.empty:
    print("No valid personal recordings found matching the expected glosses. Cannot create CSV.")
    exit()

# --- Assign Train/Val/Test Splits to the Personal Data ---
# Group by gloss first to ensure all instances of a gloss are considered for splitting
df_personal_final = pd.DataFrame()
for gloss in EXPECTED_GLOSSES_SET:
    gloss_df = df_personal_raw[df_personal_raw['gloss'] == gloss].copy()

    if len(gloss_df) == 0:
        print(f"Warning: No personal recordings found for expected gloss '{gloss}'. This gloss will be missing from the dataset.")
        continue # Skip to next gloss

    # Determine optimal split ratios based on the quantity of data you have recorded
    train_ratio = 0.70
    val_ratio = 0.15
    test_ratio = 0.15

    # Ensure enough samples for all splits (min 3 for train_test_split stratify to work well)
    if len(gloss_df) < 3:
        print(f"Warning: Gloss '{gloss}' has only {len(gloss_df)} instances. Adding all to train. (Cannot split)")
        gloss_df['split'] = 'train'
        df_personal_final = pd.concat([df_personal_final, gloss_df])
        continue

    # Split into train/test first
    train_val_df, test_df = train_test_split(
        gloss_df, test_size=test_ratio, random_state=42, stratify=gloss_df['gloss'] if len(gloss_df['gloss'].unique()) > 1 else None 
    )
    # Split train_val into train/val
    remaining_val_ratio = val_ratio / (train_ratio + val_ratio)
    train_df, val_df = train_test_split(
        train_val_df, test_size=remaining_val_ratio, random_state=42, stratify=train_val_df['gloss'] if len(train_val_df['gloss'].unique()) > 1 else None
    )

    train_df['split'] = 'train'
    val_df['split'] = 'val'
    test_df['split'] = 'test'

    df_personal_final = pd.concat([df_personal_final, train_df, val_df, test_df])

# Re-map gloss_ids to be sequential (0 to N-1) for the final set of classes
final_unique_glosses_in_dataset = df_personal_final['gloss'].unique()
final_gloss_to_id = {g: i for i, g in enumerate(final_unique_glosses_in_dataset)}
df_personal_final['gloss_id'] = df_personal_final['gloss'].map(final_gloss_to_id)

print(f"\n--- Personal Dataset Summary ---")
print(f"Total instances in final dataset: {len(df_personal_final)}")
print(f"Unique glosses: {df_personal_final['gloss'].nunique()} (Out of {len(EXPECTED_GLOSSES)} requested)")
print(f"Distribution of splits:\n{df_personal_final['split'].value_counts()}")

df_personal_final.to_csv(PERSONAL_PROCESSED_CSV, index=False)
print(f"\nPersonal dataset metadata saved to '{PERSONAL_PROCESSED_CSV}'")