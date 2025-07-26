import os
import pandas as pd
import numpy as np
import mediapipe as mp
import json
import cv2
import requests # For downloading videos
from tqdm import tqdm # For progress bars
from urllib.parse import urlparse # To parse URLs for filenames
import re # For cleaning filenames
import yt_dlp
from keyPoints import extract_keypoints

# --- DEFINE YOUR TARGET WORDS HERE ---
# Populate this list with the exact words (glosses) you want to process.
TARGET_GLOSSES = [
    # Colors
    "Red", "Blue", "green", "yellow", "pink", "purple", "orange", "brown", "grey", "gold", "Silver", "Black", "white",
    # Pronouns/Common small words
    "my", "name", "is", "you", "your", "what", "hello", "again", "are", "who", "nice", "to", "meet", "this", "I", "am", "and",
    # Family
    "Brother", "sister", "mother", "father", "girl", "boy", "parents", "grandma", "grandpa", "child", "aunt", "uncle", "siblings",
    # Emotions/Feelings
    "angry", "happy", "cry", "hurt", "sorry", "sad", "Like", "Love", "hate", "feel",
    # Verbs/Actions
    "Drive", "sleep", "watch", "Stand", "give", "understand", "walk", "go", "come", "stay", "sit", "talk",
    # Adverbs/Time related
    "Tell", "why", "now", "can",
    # Time/Days
    "Now", "Tomorrow", "today", "Future", "Monday", "Tuesday", "wednesday", "Thursday", "Friday", "Saturday", "Sunday", "year", "o'clock", "yesterday",
    # Food/Drink/Eating
    "water", "apple", "Drink", "Juice", "milk", "Pizza", "cereal", "egg", "eat", "hungry", "Full", "cup", "popcorn", "candy", "Soup",
    # Objects/Places
    "shower", "table", "lights", "computer", "hat", "chair", "Stove", "car", "ambulance", "window",
    # Animals
    "cow", "Bird", "cat", "Dog", "fish", "pet", "horse", "animal",
    # Weather/Seasons
    "Autumn", "Summer", "Winter", "Spring", "cold", "hot", "cool", "Rain", "Sun", "Freeze", "Sunrise", "wind", "Snow", "weather", "warm"
]

# Convert to a set for faster lookup
TARGET_GLOSSES_SET = set(TARGET_GLOSSES) if TARGET_GLOSSES else None

# --- Configuration ---
# MS-ASL dataset JSON file paths
MSASL_TRAIN_JSON = 'MS-ASL/MSASL_train.json'
MSASL_VAL_JSON = 'MS-ASL/MSASL_val.json'
MSASL_TEST_JSON = 'MS-ASL/MSASL_test.json'

# Parameters for sequence processing
SEQUENCE_LENGTH = 30  # Fixed sequence length like your original code

# Directory to store downloaded videos temporarily
DOWNLOAD_DIR = 'msasl_downloaded_videos'
# Directory for processed sequence data
OUTPUT_PATH = 'msasl_sequences'

# Create necessary directories
os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_PATH, exist_ok=True)

# Mediapipe setup
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# Function to download a video using yt-dlp
def download_video(url, download_path):
    """Downloads a video from a given URL to a specified path, using yt-dlp for YouTube URLs."""
    
    cleaned_url = url.strip()
    print(f"DEBUG: Attempting download for URL: {repr(cleaned_url)}")

    # Options for yt-dlp
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': download_path,
        'merge_output_format': 'mp4',
        'noplaylist': True,
        'quiet': True,  # Reduce output noise
        'no_warnings': True,
        'retries': 3,
        'fragment_retries': 3,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([cleaned_url])
        print(f"✅ Successfully downloaded {cleaned_url}")
        return True
    except yt_dlp.utils.DownloadError as e:
        print(f"❌ Error downloading {cleaned_url}: {e}")
        if os.path.exists(download_path):
            try:
                os.remove(download_path)
            except OSError as err:
                print(f"Error cleaning up partial file {download_path}: {err}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error downloading {cleaned_url}: {e}")
        if os.path.exists(download_path):
            try:
                os.remove(download_path)
            except OSError as err:
                print(f"Error cleaning up partial file {download_path}: {err}")
        return False

# Function to sanitize filename from URL
def sanitize_filename_from_url(url):
    path = urlparse(url).path
    filename = os.path.basename(path)
    filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    filename = filename.lstrip('.').replace('..', '_')
    if len(filename) > 200:
        filename = filename[:200]
    return filename if filename else 'downloaded_video.mp4'

# Main processing function
def process_msasl_split(json_path, dataset_split_name):
    print(f"\n--- Processing {dataset_split_name} split: {json_path} ---")
    
    try:
        with open(json_path, 'r') as f:
            msasl_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: JSON file not found at {json_path}. Please ensure the file exists.")
        return

    # Filter data based on target glosses
    filtered_msasl_data = []
    if TARGET_GLOSSES_SET is not None:
        print(f"Filtering {len(msasl_data)} samples to include only {len(TARGET_GLOSSES_SET)} target glosses.")
        for sample in msasl_data:
            if sample['text'] in TARGET_GLOSSES_SET:
                filtered_msasl_data.append(sample)
    else:
        filtered_msasl_data = msasl_data

    print(f"After filtering, {len(filtered_msasl_data)} samples remaining for {dataset_split_name} split.")

    # Create output directory for this action
    for gloss in set(sample['text'] for sample in filtered_msasl_data):
        action_output_path = os.path.join(OUTPUT_PATH, gloss)
        os.makedirs(action_output_path, exist_ok=True)

    # Process each sample
    for sample_idx, sample in tqdm(enumerate(filtered_msasl_data), total=len(filtered_msasl_data), desc=f"Processing {dataset_split_name} samples"):
        video_url = sample['url']
        start_time_sec = sample['start_time']
        end_time_sec = sample['end_time']
        signer_id = sample['signer_id']
        sign_gloss = sample['text']
        
        # Generate unique filename
        unique_file_part = abs(hash(video_url)) % (10**7)
        original_filename = sanitize_filename_from_url(video_url)
        downloaded_video_name = f"{unique_file_part}_{original_filename}"
        
        if not downloaded_video_name.endswith('.mp4'):
            downloaded_video_name += '.mp4'
        
        local_video_path = os.path.join(DOWNLOAD_DIR, downloaded_video_name)
        
        # Create expected output filename
        sequence_id = abs(hash(f"{video_url}_{start_time_sec}_{end_time_sec}")) % (10**10)
        output_filename = f"{signer_id}_{sequence_id}.npy"
        output_path = os.path.join(OUTPUT_PATH, sign_gloss, output_filename)
        
        # Skip if already processed
        if os.path.exists(output_path):
            print(f"⏩ Skipping {sign_gloss}/{output_filename} - already processed.")
            continue
        
        # Download video if not already present
        if not os.path.exists(local_video_path):
            if not download_video(video_url, local_video_path):
                continue
        
        # Open video and process
        cap = cv2.VideoCapture(local_video_path)
        if not cap.isOpened():
            print(f"❌ Error: Could not open downloaded video {local_video_path}")
            try:
                os.remove(local_video_path)
            except OSError as e:
                print(f"Error deleting video file: {e}")
            continue
        
        # Set the starting point in milliseconds
        cap.set(cv2.CAP_PROP_POS_MSEC, start_time_sec * 1000)
        
        sequence = []
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps == 0:
            fps = 25  # Default FPS fallback
        
        with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
            frame_count = 0
            
            while cap.isOpened() and len(sequence) < SEQUENCE_LENGTH:
                ret, frame = cap.read()
                if not ret:
                    break
                
                current_time_msec = cap.get(cv2.CAP_PROP_POS_MSEC)
                # Check if current time has exceeded end_time
                if current_time_msec / 1000 > end_time_sec + (0.5 / fps):
                    break
                
                # Process frame with MediaPipe
                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                results = holistic.process(image)
                
                # Extract keypoints using your existing function
                keypoints = extract_keypoints(results)
                
                # DEBUG: Check if keypoints are extracted properly
                if len(keypoints) == 0 or np.all(keypoints == 0):
                    print(f"WARNING: No keypoints detected in frame {frame_count} of {sign_gloss}")
                
                sequence.append(keypoints)
                frame_count += 1
        
        cap.release()
        
        # Clean up downloaded video
        try:
            os.remove(local_video_path)
        except OSError as e:
            print(f"Error deleting temporary video file {local_video_path}: {e}")
        
        # Save sequence if we have the required length
        if len(sequence) == SEQUENCE_LENGTH:
            sequence_np = np.array(sequence)
            
            # DEBUG: Check sequence statistics
            print(f"Sequence shape: {sequence_np.shape}")
            print(f"Sequence min/max: {sequence_np.min():.4f}/{sequence_np.max():.4f}")
            print(f"Sequence mean: {sequence_np.mean():.4f}")
            
            np.save(output_path, sequence_np)
            print(f"✅ Saved: {sign_gloss}/{output_filename}")
        else:
            print(f"⛔ Skipped {sign_gloss} sample — only {len(sequence)} frames (need {SEQUENCE_LENGTH})")

# Execute processing for each split
print("Starting MS-ASL sequence preprocessing...")
process_msasl_split(MSASL_TRAIN_JSON, "train")
process_msasl_split(MSASL_VAL_JSON, "validation")
process_msasl_split(MSASL_TEST_JSON, "test")

print("✅ MS-ASL sequence preprocessing completed!")