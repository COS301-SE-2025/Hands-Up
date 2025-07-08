import os
import json
import pandas as pd
import cv2 # To verify video integrity later if needed


# This function will parse the WLASL dataset from the given base data path.
def parse_wlasl_dataset(base_data_path): # Corrected function name parse_wlasl_dataset
    videos_dir = os.path.join(base_data_path, 'videos') #gets video
    wlasl_json_path = os.path.join(base_data_path, 'WLASL_v0.3.json') #gets wlasl json
    missing_txt_path = os.path.join(base_data_path, 'missing.txt') #gets missing text
    class_list_path = os.path.join(base_data_path, 'wlasl_class_list.txt') # Corrected filename: wlasl_class_list.txt


    print(f"Parsing WLASL dataset from: {base_data_path}") #this gets path directory

    if not os.path.exists(wlasl_json_path): #this checks if the wlasl json path exists
        print(f"Error: WLASL_v0.3.json not found at {wlasl_json_path}")
        return None

    with open(wlasl_json_path, 'r') as f: #this opens the wlasl json file
        wlasl_data = json.load(f)
    print(f"Loaded WLASL_v0.3.json with {len(wlasl_data)} entries (glosses).") # Removed "with" extra word

    missing_video_ids = set() #there seems to be some videos that are missing therefore we need to keep track of them
    if os.path.exists(missing_txt_path):
        with open(missing_txt_path, 'r') as f:
            for line in f:
                missing_video_ids.add(line.strip())
        print(f"Loaded missing.txt with {len(missing_video_ids)} missing video IDs.") # Removed extra space
    else:
        print(f"Warning: missing.txt not found at {missing_txt_path}. Proceeding without it.")

    gloss_id_map = {} # Corrected variable name: gloss_id_map
    id_gloss_map = {} # Corrected variable name: id_gloss_map
    if os.path.exists(class_list_path):
        with open(class_list_path, 'r') as f:
            for line in f:
                parts = line.strip().split('\t')
                if len(parts) == 2:
                    gloss_id_map[int(parts[0])] = parts[1] # Corrected: gloss_id_map, int(parts[0]), parts[1]
                    id_gloss_map[parts[1]] = int(parts[0]) # Corrected: int(parts[0]) for the value
        print(f"Loaded wlasl_class_list.txt with {len(gloss_id_map)} classes.") # Corrected filename print

    else:
        print(f"Warning: wlasl_class_list.txt not found at {class_list_path}. Gloss names will be used directly from WLASL_v0.3.json.")

    # Process instances and build a DataFrame
    data_records = []
    available_videos_count = 0 # Corrected variable name: available_videos_count
    total_instances = 0

    for gloss_entry in wlasl_data:
        gloss = gloss_entry['gloss']
        for instance in gloss_entry['instances']:
            total_instances += 1
            video_id = instance['video_id']

            if video_id in missing_video_ids:
                #print(f"Skipping missing video: {video_id} ({gloss})")
                continue

            video_filename = f"{video_id}.mp4"
            video_full_path = os.path.join(videos_dir, video_filename)

            if os.path.exists(video_full_path):
                available_videos_count += 1 # Corrected variable name
                data_records.append({
                    'gloss': gloss,
                    'gloss_id': id_gloss_map.get(gloss, -1), # Use mapped ID if available
                    'video_id': video_id,
                    'video_path': video_full_path,
                    'signer_id': instance.get('signer_id'),
                    'split': instance.get('split'), # train, val, test
                    'frame_start': instance.get('frame_start'),
                    'frame_end': instance.get('frame_end'),
                    'fps': instance.get('fps'),
                    'bbox': instance.get('bbox') # Bounding box for signer, useful but not critical for landmark estimation
                })
            else:
                # print(f"Warning: Video file not found on disk: {video_full_path} for gloss '{gloss}' (ID: {video_id})") # Uncomment for verbose
                pass # Silently skip files not found on disk
    df = pd.DataFrame(data_records)
    print(f"\n--- Parsing Summary ---")
    print(f"Total instances in WLASL_v0.3.json: {total_instances}")
    # The calculation for skipped instances is tricky without knowing exactly what df['split'].isnull() does
    # Let's simplify this line for now, or ensure the original logic is sound.
    # It attempts to count instances that were processed but don't have a 'split', which isn't the same as 'skipped by missing.txt'
    # A more robust check might involve comparing total_instances with len(df) directly.
    # For now, let's just make sure the variable names are correct.
    print(f"Instances skipped due to 'missing.txt' and not found on disk: {total_instances - available_videos_count}") # Simplified for clarity

    print(f"Total *available* and valid video instances found: {available_videos_count}")
    print(f"DataFrame created with {len(df)} entries.")
    print(f"Unique glosses (signs) found: {df['gloss'].nunique()}")
    print(f"Distribution of splits:\n{df['split'].value_counts()}")

    return df

if __name__ == "__main__":
    # IMPORTANT: Ensure your dataset structure matches.
    # If your 'videos' folder, 'WLASL_v0.3.json', 'missing.txt', etc., are
    # directly in the 'translate' folder (where this script is), then '.' is correct.
    wlasl_dataset_path = "." # This means the script expects files in the same directory as itself.

    wlasl_df = parse_wlasl_dataset(wlasl_dataset_path)

    if wlasl_df is not None:
        print("\nFirst 5 entries of the processed DataFrame:")
        print(wlasl_df.head())

        # Example: Find all entries for the gloss "book"
        book_entries = wlasl_df[wlasl_df['gloss'] == 'book']
        print(f"\nFound {len(book_entries)} instances for 'book'. Example path:")
        if not book_entries.empty:
            print(book_entries.iloc[0]['video_path'])
        
        # Example: Check for a specific video ID (e.g., 00377, from your example)
        # You need to make sure 00377.mp4 is actually in your 'videos' folder.
        specific_video_entry = wlasl_df[wlasl_df['video_id'] == '00377']
        if not specific_video_entry.empty:
            print(f"\nFound entry for video ID '00377':")
            print(specific_video_entry.iloc[0])
        else:
            print(f"\nVideo ID '00377' not found in processed data (might be missing or not on disk).")

        nslt_json_path = os.path.join(wlasl_dataset_path, 'nslt_100.json')
        if os.path.exists(nslt_json_path):
            with open(nslt_json_path, 'r') as f:
                nslt_100_data = json.load(f)

            nslt_100_video_ids = set(nslt_100_data.keys())

            df_nslt_100 = wlasl_df[wlasl_df['video_id'].isin(nslt_100_video_ids)].copy()

            print(f"\n--- NSLT 100 Subset Summary ---")
            print(f"Total instances in NSLT-100 subset: {len(df_nslt_100)}")
            print(f"Unique glosses (signs) in NSLT-100: {df_nslt_100['gloss'].nunique()}")
            print(f"Distribution of splits:\n{df_nslt_100['split'].value_counts()}")
            print("First 5 entries of NSLT-100 DataFrame:")
            print(df_nslt_100.head())

            # You can save this subset DataFrame for later use
            df_nslt_100.to_csv('wlasl_nslt_100_processed.csv', index=False)
            print("\nNSLT-100 processed data saved to 'wlasl_nslt_100_processed.csv'")
        else:
            print(f"Warning: {nslt_json_path} not found. Cannot filter for NSLT-100 subset.")
            print("You can proceed with the full WLASL dataset or manually create a smaller subset for initial development.")