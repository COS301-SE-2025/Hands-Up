import pandas as pd
import numpy as np
import os
import re # For regular expressions to parse filenames

# --- Configuration ---
WLASL_PROCESSED_CSV = 'wlasl_10_words_processed.csv'
MY_RECORDED_SIGNS_DIR = 'my_recorded_signs'
COMBINED_PROCESSED_CSV = 'wlasl_10_words_combined_processed.csv'

print(f"--- Combining WLASL and Personal Data ---")

# Load WLASL data
if not os.path.exists(WLASL_PROCESSED_CSV):
    print(f"Error: WLASL processed CSV not found at {WLASL_PROCESSED_CSV}.")
    print("Please ensure wlasl_parser.py has been run for your 10-word list.")
    exit()

df_wlasl = pd.read_csv(WLASL_PROCESSED_CSV)
print(f"Loaded {len(df_wlasl)} instances from WLASL: {WLASL_PROCESSED_CSV}")

# --- Process Personal Recordings ---
personal_records = []
if os.path.exists(MY_RECORDED_SIGNS_DIR):
    print(f"Scanning for personal recordings in: {MY_RECORDED_SIGNS_DIR}")
    for filename in os.listdir(MY_RECORDED_SIGNS_DIR):
        if filename.endswith('.npy'):
            # Example filename: 'apple_1678901234.npy'
            match = re.match(r'(.+?)_(\d+)\.npy', filename)
            if match:
                gloss = match.group(1).lower() # Extract gloss, ensure lowercase
                video_id = match.group(2) # Use timestamp as a unique ID

                full_npy_path = os.path.join(MY_RECORDED_SIGNS_DIR, filename)

                # We need to verify if the original video_id exists for context, 
                # but for personal recordings, the NPY is the "video" representation.
                # We'll treat the NPY path as the 'video_path' for these.

                # Get original gloss_id mapping from WLASL data to ensure consistency
                # This assumes all personal glosses are already in the 10-word list
                original_gloss_to_id = {g:i for i, g in enumerate(df_wlasl['gloss'].unique())}

                if gloss in original_gloss_to_id:
                    personal_records.append({
                        'gloss': gloss,
                        'gloss_id': original_gloss_to_id[gloss], # Use WLASL's mapping
                        'video_id': f'personal_{video_id}', # Prefix to differentiate from WLASL
                        'video_path': full_npy_path, # Path to the NPY file itself
                        'signer_id': 'personal',
                        'split': 'train', # New personal data always goes to train
                        'frame_start': 1, # Dummy values as it's already extracted
                        'frame_end': -1,  # Dummy values
                        'fps': 25,        # Assume 25 FPS for consistency
                        'bbox': [0,0,0,0] # Dummy bbox
                    })
                else:
                    print(f"Warning: Personal recording '{filename}' has gloss '{gloss}' which is not in the 10-word WLASL list. Skipping.")
            else:
                print(f"Warning: Could not parse filename for '{filename}'. Skipping.")
else:
    print(f"Warning: Personal recordings directory '{MY_RECORDED_SIGNS_DIR}' not found. No personal data will be added.")

df_personal = pd.DataFrame(personal_records)
print(f"Found {len(df_personal)} personal recordings.")

# Combine DataFrames
# We need to ensure columns are compatible for concatenation
# The 'video_path' for WLASL points to MP4, for personal it points to NPY.
# landmark_extractor and data_preprocessor will need to handle this.
df_combined = pd.concat([df_wlasl, df_personal], ignore_index=True)

# Re-map gloss_ids to be sequential (0 to N-1) for the entire combined set
# This is CRITICAL because the unique glosses list might change if warnings were ignored
final_unique_glosses = df_combined['gloss'].unique()
final_gloss_to_id = {g: i for i, g in enumerate(final_unique_glosses)}
df_combined['gloss_id'] = df_combined['gloss'].map(final_gloss_to_id)


print(f"\n--- Combined Dataset Summary ---")
print(f"Total instances in combined dataset: {len(df_combined)}")
print(f"Unique glosses in combined dataset: {df_combined['gloss'].nunique()} (Expected: {len(df_wlasl['gloss'].unique())})")
print(f"Distribution of splits:\n{df_combined['split'].value_counts()}")
print(f"First 5 entries of Combined DataFrame:\n{df_combined.head()}")
print(f"Last 5 entries of Combined DataFrame (should include personal data):\n{df_combined.tail()}")

df_combined.to_csv(COMBINED_PROCESSED_CSV, index=False)
print(f"\nCombined dataset metadata saved to '{COMBINED_PROCESSED_CSV}'")

# --- Special Note for landmark_extractor.py ---
print("\nIMPORTANT: Next, you MUST modify landmark_extractor.py to handle .npy video_paths for personal data.")
print("          Look for changes related to 'full_video_path_on_disk' in the extract_landmarks_from_video function.")