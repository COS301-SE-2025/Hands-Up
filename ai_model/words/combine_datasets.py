import pandas as pd
import numpy as np
import os
import re

WLASL_PROCESSED_CSV = 'wlasl_10_words_processed.csv'
MY_RECORDED_SIGNS_DIR = 'my_recorded_signs'
COMBINED_PROCESSED_CSV = 'wlasl_10_words_combined_processed.csv'

print(f"--- Combining WLASL and Personal Data ---")

if not os.path.exists(WLASL_PROCESSED_CSV):
    print(f"Error: WLASL processed CSV not found at {WLASL_PROCESSED_CSV}.")
    print("Please ensure wlasl_parser.py has been run for your 10-word list.")
    exit()

df_wlasl = pd.read_csv(WLASL_PROCESSED_CSV)
print(f"Loaded {len(df_wlasl)} instances from WLASL: {WLASL_PROCESSED_CSV}")

personal_records = []
if os.path.exists(MY_RECORDED_SIGNS_DIR):
    print(f"Scanning for personal recordings in: {MY_RECORDED_SIGNS_DIR}")
    for filename in os.listdir(MY_RECORDED_SIGNS_DIR):
        if filename.endswith('.npy'):
            match = re.match(r'(.+?)_(\d+)\.npy', filename)
            if match:
                gloss = match.group(1).lower()
                video_id = match.group(2) 

                full_npy_path = os.path.join(MY_RECORDED_SIGNS_DIR, filename)

                original_gloss_to_id = {g:i for i, g in enumerate(df_wlasl['gloss'].unique())}

                if gloss in original_gloss_to_id:
                    personal_records.append({
                        'gloss': gloss,
                        'gloss_id': original_gloss_to_id[gloss], 
                        'video_id': f'personal_{video_id}', 
                        'video_path': full_npy_path, 
                        'signer_id': 'personal',
                        'split': 'train', 
                        'frame_start': 1, 
                        'frame_end': -1,  
                        'fps': 25,        
                        'bbox': [0,0,0,0] 
                    })
                else:
                    print(f"Warning: Personal recording '{filename}' has gloss '{gloss}' which is not in the 10-word WLASL list. Skipping.")
            else:
                print(f"Warning: Could not parse filename for '{filename}'. Skipping.")
else:
    print(f"Warning: Personal recordings directory '{MY_RECORDED_SIGNS_DIR}' not found. No personal data will be added.")

df_personal = pd.DataFrame(personal_records)
print(f"Found {len(df_personal)} personal recordings.")

df_combined = pd.concat([df_wlasl, df_personal], ignore_index=True)

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

print("\nIMPORTANT: Next, you MUST modify landmark_extractor.py to handle .npy video_paths for personal data.")
print("          Look for changes related to 'full_video_path_on_disk' in the extract_landmarks_from_video function.")