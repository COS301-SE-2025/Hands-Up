import os
import re
from collections import defaultdict

# --- Configuration ---
# The directory where your .npy recordings are stored.
RECORDINGS_DIR = 'my_recorded_signs'

def get_unique_glosses_from_recordings(directory):
    """
    Scans a directory for .npy files and extracts the unique glosses
    (words) from their filenames.
    
    Args:
        directory (str): The path to the directory containing recordings.
        
    Returns:
        A defaultdict with glosses as keys and a count of recordings as values.
    """
    gloss_counts = defaultdict(int)
    
    if not os.path.isdir(directory):
        print(f"Error: Directory not found at {directory}. Please check the path.")
        return gloss_counts
    
    for filename in os.listdir(directory):
        # We need a regex pattern to handle different timestamps and file extensions
        # Pattern: (word)_(timestamp).npy
        match = re.match(r'(.+?)_\d+\.npy', filename, re.IGNORECASE)
        
        if match:
            # Extract the gloss (the first group in the regex) and convert to lowercase
            gloss = match.group(1).lower()
            gloss_counts[gloss] += 1
            
    return gloss_counts

if __name__ == "__main__":
    print(f"--- Scanning for Unique Signs in '{RECORDINGS_DIR}' ---")
    
    unique_glosses_with_counts = get_unique_glosses_from_recordings(RECORDINGS_DIR)
    
    if not unique_glosses_with_counts:
        print("No valid recordings found. Make sure your .npy files are in the correct directory.")
    else:
        # Sort the glosses alphabetically for a clean, repeatable output
        sorted_glosses = sorted(unique_glosses_with_counts.keys())
        
        print(f"\nFound {len(sorted_glosses)} unique glosses:")
        print("---------------------------------")
        for gloss in sorted_glosses:
            count = unique_glosses_with_counts[gloss]
            print(f"- {gloss:<15}: {count} recordings")
        print("---------------------------------")
        
        # You can now easily copy this list into your create_personal_dataset_csv.py script.
        # Here is the list format for easy copying:
        print("\nReady to copy to your EXPECTED_GLOSSES list:")
        print("EXPECTED_GLOSSES = [")
        for i, gloss in enumerate(sorted_glosses):
            print(f"    \"{gloss}\",")
        print("]")