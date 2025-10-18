import pandas as pd
import os
import cv2 

PROCESSED_DATA_CSV = 'wlasl_20_words_processed.csv'

WLASL_VIDEOS_DIR = './videos' 


if os.path.exists(PROCESSED_DATA_CSV):
    df_subset = pd.read_csv(PROCESSED_DATA_CSV)

    actual_durations = []

    print("Calculating actual video durations (this might take a moment)...")
    for index, row in df_subset.iterrows():
        video_path = row['video_path']
        frame_start = row['frame_start']
        frame_end = row['frame_end']

        duration = 0
        if frame_end != -1 and frame_end >= frame_start:
            duration = frame_end - frame_start + 1
        else:
            full_video_path_on_disk = video_path 

            cap = cv2.VideoCapture(full_video_path_on_disk)
            if cap.isOpened():
                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                if total_frames > 0 and frame_start > 0:
                    duration = total_frames - frame_start + 1
                    if duration < 0: duration = 0 
                cap.release()
            else:
                print(f"Warning: Could not open video file {full_video_path_on_disk} to get full duration. Assigning 0.")
                duration = 0 

        actual_durations.append(duration)

    df_subset['duration_frames'] = actual_durations

    df_subset = df_subset[df_subset['duration_frames'] > 0]


    print(f"--- WLASL Fixed List Video Duration Analysis (20 Words - CORRECTED) ---")
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