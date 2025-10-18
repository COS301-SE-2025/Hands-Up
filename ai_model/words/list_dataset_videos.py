import pandas as pd
import os


PROCESSED_DATA_CSV = 'wlasl_20_words_processed.csv' 


BASE_DIR = os.getcwd() 

MAX_VIDEOS_PER_SIGN_TO_DISPLAY = 5 


print(f"--- Listing Video Files and Sign Names for Dataset: {PROCESSED_DATA_CSV} (20 Words) ---") 

if not os.path.exists(PROCESSED_DATA_CSV):
    print(f"Error: Processed data CSV not found at {PROCESSED_DATA_CSV}.")
    print("Please ensure wlasl_parser.py has been run for your 20-word list.") 
    exit()

try:
    df_videos = pd.read_csv(PROCESSED_DATA_CSV)
    print(f"Loaded {len(df_videos)} video entries.")

    print(f"\nExact video paths and their corresponding sign names (glosses) (showing max {MAX_VIDEOS_PER_SIGN_TO_DISPLAY} per sign):")
    
    videos_displayed_per_sign = {} # To track how many videos we've shown for each sign
    total_found_on_disk = 0

    df_videos_sorted = df_videos.sort_values(by='gloss').reset_index(drop=True)

    for index, row in df_videos_sorted.iterrows(): # Iterate through the sorted DataFrame
        gloss = row['gloss']
        relative_video_path = row['video_path']
        full_video_path = os.path.join(BASE_DIR, relative_video_path)
        
        # Check if we've already displayed the max for this sign
        if videos_displayed_per_sign.get(gloss, 0) >= MAX_VIDEOS_PER_SIGN_TO_DISPLAY:
            continue # Skip to the next video if limit reached for this gloss
        
        if os.path.exists(full_video_path):
            print(f"  Sign: {gloss.upper():<10} | Path: {full_video_path}")
            videos_displayed_per_sign[gloss] = videos_displayed_per_sign.get(gloss, 0) + 1
            total_found_on_disk += 1
        else:
            print(f"  [NOT FOUND ON DISK] Sign: {gloss.upper():<10} | Path: {full_video_path}")
            videos_displayed_per_sign[gloss] = videos_displayed_per_sign.get(gloss, 0) + 1 
            
    print(f"\nTotal video files found on disk and displayed: {total_found_on_disk}")
    print(f"Total available instances in CSV: {len(df_videos)}")


except Exception as e:
    print(f"An error occurred: {e}")