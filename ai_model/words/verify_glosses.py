import os
import re

# --- Configuration ---
# The directory containing your recorded NPY files
RECORDING_DIR = 'my_recorded_signs' 

# The definitive list of all 78 glosses you intend to train on.
REQUIRED_GLOSSES = {
    # 60 Working Words + Fixed:
    "red", "yellow", "purple", "brown", "grey", "gold", "black", "you", "your", "what", 
    "hello", "again", "nice", "meet", "boy", "parents", "child", "aunt", "cry", "hurt", 
    "sad", "love", "drive", "sleep", "stand", "come", "stay", "can", "tomorrow", "today", 
    "future", "monday", "tuesday", "wednesday", "sunday", "year", "yesterday", 
    "water", "apple", "drink", "pizza", "eat", "cup", "shower", "light", "computer", 
    "hate", "chair", "car", "ambulance", "cow", "bird", "cat", "dog", "autum", 
    "summer", "spring", "cold", "rain", "freeze", "sunrise", "wind", "weather", 
    "go", "drive-there", 
    # 18 Words Added/Restored for Demo Script:
    "my", "name", "this", "our", "i", "university", "student", "translation", "real", 
    "time", "try", "end", "demonstration", "with", "force",
    # 8 Restored Words
    "am", "and", "give", "hot", "mother", "sun", "uncle", "work"
}

FINAL_GLOSS_SET = set(g.lower() for g in REQUIRED_GLOSSES)
print(f"--- Checking against the definitive {len(FINAL_GLOSS_SET)} required glosses ---")

# --- Main Verification Logic ---
if not os.path.exists(RECORDING_DIR):
    print(f"\nERROR: Directory '{RECORDING_DIR}' not found. Please create it or check the path.")
    exit()

# 1. Get all unique glosses found in the folder
found_glosses = set()
for filename in os.listdir(RECORDING_DIR):
    if filename.lower().endswith('.npy'):
        # Regex to capture the gloss part: "gloss_timestamp.npy"
        match = re.match(r'(.+?)_\d+\.npy', filename, re.IGNORECASE) 
        if match:
            gloss = match.group(1).strip().lower() 
            found_glosses.add(gloss)

# 2. Check for missing glosses
missing_glosses = FINAL_GLOSS_SET - found_glosses

# 3. Check for extra/unwanted glosses (must be deleted)
# This line is corrected:
extra_glosses = found_glosses - FINAL_GLOSS_SET 

# --- Display Results ---
print("\n" + "="*50)
print("             FINAL DATA VERIFICATION RESULTS")
print("="*50)

if not missing_glosses and not extra_glosses:
    print("\n✅ SUCCESS: Your 'my_recorded_signs' directory matches the final 78-word list!")
    print(f"Total Unique Glosses Found: {len(found_glosses)}")
    print("\nPROCEED TO STEP 3: Run your 'create_personal_dataset.py' script and retrain the model.")
else:
    if missing_glosses:
        print("\n❌ MISSING GLOSSES (You need to record these!):")
        print(f"Total Missing: {len(missing_glosses)}")
        print(", ".join(sorted(list(missing_glosses))))
        
    if extra_glosses:
        print("\n⚠️ EXTRA/UNWANTED GLOSSES (You need to delete all NPY files for these!):")
        print(f"Total Extra: {len(extra_glosses)}")
        print(", ".join(sorted(list(extra_glosses))))
        print("\n🛑 Action Required: Delete the NPY files for these extra words and record the missing ones.")

print("\n" + "="*50)
