import pandas as pd
import numpy as np
import os
import re 
from sklearn.model_selection import train_test_split 

MY_RECORDED_SIGNS_DIR = 'my_recorded_signs'
PERSONAL_PROCESSED_CSV = 'wlasl_125_words_personal_processed.csv' 

EXPECTED_GLOSSES = [
    "again",
    "ambulance",
    "and",
    "angry",
    "animal",
    "apple",
    "aunt",
    "autum",
    "bird",
    "black",
    "blue",
    "boy",
    "brother",
    "brown",
    "can",
    "candy",
    "car",
    "cat",
    "cereal",
    "chair",
    "child",
    "cold",
    "come",
    "computer",
    "cool",
    "cow",
    "cry",
    "cup",
    "deaf",
    "dog",
    "drink",
    "drive",
    "drive-there",
    "eat",
    "egg",
    "father",
    "feel",
    "fish",
    "freeze",
    "friday",
    "full",
    "future",
    "girl",
    "give",
    "go",
    "gold",
    "grandma",
    "grandpa",
    "green",
    "grey",
    "happy",
    "hate",
    "hello",
    "horse",
    "hot",
    "hungry",
    "hurt",
    "juice",
    "light",
    "like",
    "love",
    "meet",
    "milk",
    "monday",
    "mother",
    "my",
    "name",
    "nice",
    "now",
    "o'clock",
    "orange",
    "parents",
    "pet",
    "pink",
    "pizza",
    "popcorn",
    "purple",
    "rain",
    "red",
    "sad",
    "saturday",
    "shower",
    "siblings",
    "silver",
    "sister",
    "sit",
    "sleep",
    "snow",
    "sorry",
    "soup",
    "spring",
    "stand",
    "stay",
    "summer",
    "sun",
    "sunday",
    "sunrise",
    "table",
    "talk",
    "tell",
    "this",
    "thursday",
    "today",
    "tomorrow",
    "tuesday",
    "uncle",
    "understand",
    "walk",
    "warm",
    "watch",
    "water",
    "weather",
    "wednesday",
    "what",
    "white",
    "who",
    "why",
    "wind",
    "window",
    "winter",
    "year",
    "yellow",
    "yesterday",
    "you",
    "your",
]
EXPECTED_GLOSSES_SET = set(g.lower() for g in EXPECTED_GLOSSES)


print(f"--- Generating CSV from Personal Recordings Only ---")

personal_records = []
if os.path.exists(MY_RECORDED_SIGNS_DIR):
    print(f"Scanning for personal recordings in: {MY_RECORDED_SIGNS_DIR}")
    for filename in os.listdir(MY_RECORDED_SIGNS_DIR):
        if filename.lower().endswith('.npy'):
           
            match = re.match(r'(.+?)_(\d+)\.npy', filename, re.IGNORECASE)
            if match:
                gloss = match.group(1).lower() 
                video_id_from_timestamp = match.group(2) 

                full_npy_path = os.path.join(MY_RECORDED_SIGNS_DIR, filename)

                if gloss in EXPECTED_GLOSSES_SET:
                    personal_records.append({
                        'gloss': gloss,
                        'video_id': f'personal_{video_id_from_timestamp}',
                        'video_path': full_npy_path, 
                        'signer_id': 'personal_user',
                        'frame_start': 1,
                        'frame_end': -1,
                        'fps': 25,
                        'bbox': [0,0,0,0],
                        'split': 'temp' 
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


df_personal_final = pd.DataFrame()
for gloss in EXPECTED_GLOSSES_SET:
    gloss_df = df_personal_raw[df_personal_raw['gloss'] == gloss].copy()

    if len(gloss_df) == 0:
        print(f"Warning: No personal recordings found for expected gloss '{gloss}'. This gloss will be missing from the dataset.")
        continue 

    train_ratio = 0.70
    val_ratio = 0.15
    test_ratio = 0.15

    
    if len(gloss_df) < 3:
        print(f"Warning: Gloss '{gloss}' has only {len(gloss_df)} instances. Adding all to train. (Cannot split)")
        gloss_df['split'] = 'train'
        df_personal_final = pd.concat([df_personal_final, gloss_df])
        continue

   
    train_val_df, test_df = train_test_split(
        gloss_df, test_size=test_ratio, random_state=42, stratify=gloss_df['gloss'] if len(gloss_df['gloss'].unique()) > 1 else None # Stratify only if multiple classes present, which is true here.
    )
    
    remaining_val_ratio = val_ratio / (train_ratio + val_ratio)
    train_df, val_df = train_test_split(
        train_val_df, test_size=remaining_val_ratio, random_state=42, stratify=train_val_df['gloss'] if len(train_val_df['gloss'].unique()) > 1 else None
    )

    train_df['split'] = 'train'
    val_df['split'] = 'val'
    test_df['split'] = 'test'

    df_personal_final = pd.concat([df_personal_final, train_df, val_df, test_df])

final_unique_glosses_in_dataset = df_personal_final['gloss'].unique()
final_gloss_to_id = {g: i for i, g in enumerate(final_unique_glosses_in_dataset)}
df_personal_final['gloss_id'] = df_personal_final['gloss'].map(final_gloss_to_id)

print(f"\n--- Personal Dataset Summary ---")
print(f"Total instances in final dataset: {len(df_personal_final)}")
print(f"Unique glosses: {df_personal_final['gloss'].nunique()} (Out of {len(EXPECTED_GLOSSES)} requested)")
print(f"Distribution of splits:\n{df_personal_final['split'].value_counts()}")

df_personal_final.to_csv(PERSONAL_PROCESSED_CSV, index=False)
print(f"\nPersonal dataset metadata saved to '{PERSONAL_PROCESSED_CSV}'")