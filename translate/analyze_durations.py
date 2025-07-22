# analyze_durations.py (CORRECTED for -1 frame_end)
import pandas as pd
import os
import cv2 # NEW IMPORT for reading video durations

# IMPORTANT: This path must point to the CSV created in the previous step
PROCESSED_DATA_CSV = 'wlasl_10_words_processed.csv' 
# Path to your main WLASL videos directory (e.g., if videos are in ./videos/)
WLASL_VIDEOS_DIR = './videos' 


if os.path.exists(PROCESSED_DATA_CSV):
    df_subset = pd.read_csv(PROCESSED_DATA_CSV)

    actual_durations = []

    print("Calculating actual video durations (this might take a moment)...")
    for index, row in df_subset.iterrows():
        video_path = row['video_path'] # This path is already complete relative to project root
        frame_start = row['frame_start']
        frame_end = row['frame_end']

        duration = 0
        if frame_end != -1 and frame_end >= frame_start:
            duration = frame_end - frame_start + 1
        else:
            # If frame_end is -1, we need to check the actual video file length
            full_video_path_on_disk = video_path # video_path column already contains full path

            cap = cv2.VideoCapture(full_video_path_on_disk)
            if cap.isOpened():
                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                if total_frames > 0 and frame_start > 0:
                    # If frame_end is -1, it means until end of the video segment.
                    # So, duration is total frames from actual video minus the start_frame + 1
                    duration = total_frames - frame_start + 1
                    if duration < 0: duration = 0 # Prevent negative durations
                cap.release()
            else:
                print(f"Warning: Could not open video file {full_video_path_on_disk} to get full duration. Assigning 0.")
                duration = 0 # Assign 0 if video cannot be opened

        actual_durations.append(duration)

    df_subset['duration_frames'] = actual_durations

    # Filter out potentially invalid durations (e.g., 0 if video couldn't be opened)
    df_subset = df_subset[df_subset['duration_frames'] > 0]


    print(f"--- WLASL Fixed List Video Duration Analysis (10 Words - CORRECTED) ---")
    print(f"Total instances analyzed: {len(df_subset)}")
    print(f"Min duration (frames): {df_subset['duration_frames'].min()}")
    print(f"Max duration (frames): {df_subset['duration_frames'].max()}")
    print(f"Mean duration (frames): {df_subset['duration_frames'].mean():.2f}")
    print(f"Median duration (frames): {df_subset['duration_frames'].median()}")
    print(f"75th percentile duration (frames): {df_subset['duration_frames'].quantile(0.75)}")
    print(f"90th percentile duration (frames): {df_subset['duration_frames'].quantile(0.90)}")

    print(f"\nMean FPS: {df_subset['fps'].mean():.2f}")
    print(f"Most common FPS: {df_subset['fps'].mode()[0] if not df_subset['fps'].mode().empty else 'N/A'}")
else:
    print(f"Error: {PROCESSED_DATA_CSV} not found. Please run wlasl_parser.py for your fixed list first.")