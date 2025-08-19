import os
import json
import pandas as pd
import cv2 

# --- CONFIGURATION FOR TARGET WORD LIST ---
# This is your CUMULATIVE 20-word subset (lowercase recommended for WLASL compatibility)
TARGET_GLOSS_LIST = [
    # Your original 10 words:
    "apple", "black", "blue", "brown", "can", "cat", "chair", "child", "cold", "come",
    # Your NEW 10 words:
    "computer", "cow", "cry", "cup", "deaf", "dog", "drink", "drive", "eat", "egg"
]
TARGET_GLOSS_SET = set(g.lower() for g in TARGET_GLOSS_LIST) # Convert to set of lowercase glosses

# --- GLOSSES TO EXCLUDE (ALPHABETS) ---
ALPHABET_GLOSSES = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
]
GLOSSES_TO_EXCLUDE_SET = set(g.lower() for g in ALPHABET_GLOSSES) # Convert to lowercase set for comparison
# --- END CONFIGURATION ---

def parse_wlasl_dataset(base_data_path):
    videos_dir = os.path.join(base_data_path, 'videos')
    wlasl_json_path = os.path.join(base_data_path, 'WLASL_v0.3.json')
    missing_txt_path = os.path.join(base_data_path, 'missing.txt')
    class_list_path = os.path.join(base_data_path, 'wlasl_class_list.txt') # For original class list

    print(f"Parsing WLASL dataset from: {base_data_path}")

    if not os.path.exists(wlasl_json_path):
        print(f"Error: WLASL_v0.3.json not found at {wlasl_json_path}")
        return None

    with open(wlasl_json_path, 'r') as f:
        wlasl_data = json.load(f)
    print(f"Loaded WLASL_v0.3.json with {len(wlasl_data)} entries (glosses).")

    missing_video_ids = set()
    if os.path.exists(missing_txt_path):
        with open(missing_txt_path, 'r') as f:
            for line in f:
                missing_video_ids.add(line.strip())
        print(f"Loaded missing.txt with {len(missing_video_ids)} missing video IDs.")
    else:
        print(f"Warning: missing.txt not found at {missing_txt_path}. Proceeding without it.")

    gloss_id_map_orig = {} 
    if os.path.exists(class_list_path):
        with open(class_list_path, 'r') as f:
            for line in f:
                parts = line.strip().split('\t')
                if len(parts) == 2:
                    gloss_id_map_orig[int(parts[0])] = parts[1]
            
    data_records = []
    available_videos_count = 0
    total_instances = 0

    for gloss_entry in wlasl_data:
        gloss = gloss_entry['gloss']
        for instance in gloss_entry['instances']:
            total_instances += 1
            video_id = instance['video_id']

            if video_id in missing_video_ids:
                continue

            # --- FILTERING: INCLUDE IN TARGET SET AND NOT IN EXCLUDE SET ---
            gloss_lower = gloss.lower()
            if gloss_lower not in TARGET_GLOSS_SET:
                continue # Skip if not in our desired target list
            if gloss_lower in GLOSSES_TO_EXCLUDE_SET:
                # print(f"Skipping excluded alphabet gloss: {gloss}") # Uncomment to see what's skipped
                continue # Skip if it's an alphabet gloss

            video_filename = f"{video_id}.mp4"
            video_full_path = os.path.join(videos_dir, video_filename)

            if os.path.exists(video_full_path):
                available_videos_count += 1
                data_records.append({
                    'gloss': gloss,
                    'gloss_id': gloss_id_map_orig.get(gloss, -1), # Use original ID for now, re-map later
                    'video_id': video_id,
                    'video_path': video_full_path,
                    'signer_id': instance.get('signer_id'),
                    'split': instance.get('split'),
                    'frame_start': instance.get('frame_start'),
                    'frame_end': instance.get('frame_end'),
                    'fps': instance.get('fps'),
                    'bbox': instance.get('bbox')
                })
            else:
                pass 
            
    df = pd.DataFrame(data_records)
    print(f"\n--- Parsing Summary ---")
    print(f"Total instances in WLASL_v0.3.json: {total_instances}")
    print(f"Instances skipped due to 'missing.txt' and not found on disk: {total_instances - available_videos_count}")
    print(f"Total *available* and valid video instances found (before target list filter): {available_videos_count}")
    
    return df

if __name__ == "__main__":
    wlasl_dataset_path = "." 
    wlasl_df = parse_wlasl_dataset(wlasl_dataset_path)

    if wlasl_df is not None:
        df_filtered_by_glosses = wlasl_df[wlasl_df['gloss'].str.lower().isin(TARGET_GLOSS_SET)].copy()
        
        # --- NEW EXCLUSION: Remove alphabet glosses from the final filtered DataFrame ---
        df_filtered_by_glosses = df_filtered_by_glosses[~df_filtered_by_glosses['gloss'].str.lower().isin(GLOSSES_TO_EXCLUDE_SET)].copy()

        # Re-map gloss_ids to be sequential (0 to N-1) for the new, smaller set of classes
        unique_filtered_glosses = df_filtered_by_glosses['gloss'].unique()
        new_gloss_to_id = {gloss: i for i, gloss in enumerate(unique_filtered_glosses)}
        df_filtered_by_glosses['gloss_id'] = df_filtered_by_glosses['gloss'].map(new_gloss_to_id)

        print(f"\n--- Fixed Word List Subset Summary ({len(TARGET_GLOSS_SET)} words requested, {df_filtered_by_glosses['gloss'].nunique()} words after filtering) ---")
        print(f"Total instances in fixed list subset: {len(df_filtered_by_glosses)}")
        print(f"Unique glosses in fixed list: {df_filtered_by_glosses['gloss'].nunique()} (Expected: {len(TARGET_GLOSS_SET) - len(GLOSSES_TO_EXCLUDE_SET.intersection(TARGET_GLOSS_SET))})")
        print(f"Distribution of splits:\n{df_filtered_by_glosses['split'].value_counts()}")
        print("First 5 entries of Fixed List DataFrame:")
        print(df_filtered_by_glosses.head())

        output_csv_name = 'wlasl_20_words_processed.csv' # <-- CHANGED TO 20 WORDS
        df_filtered_by_glosses.to_csv(output_csv_name, index=False)
        print(f"\nFixed list processed data saved to '{output_csv_name}'")
    else:
        print("\nError: Could not parse base WLASL dataset. Cannot filter by fixed list.")