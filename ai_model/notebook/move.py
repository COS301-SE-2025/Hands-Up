import os
import shutil
import pickle

# --- Configuration Constants (must match your training script) ---
PROCESSED_PATH = 'super_augmented_dataset'  # Source path for your processed keypoint data
LEARNED_WORDS_PATH = 'learnedWords'         # Destination path for learned action data
LABEL_MAP_PATH = 'label_map.pkl'            # Path to the action-label mapping file

def move_learned_words():
    """
    Identifies actions learned by the LSTM model from the label map and
    moves their corresponding data directories from the processed dataset
    to a designated 'learnedWords' folder.
    """
    print("=== Starting Learned Words Mover ===")
    
    # 1. Load the label map to get the list of learned actions
    learned_actions = []
    if os.path.exists(LABEL_MAP_PATH):
        try:
            with open(LABEL_MAP_PATH, 'rb') as f:
                label_map = pickle.load(f)
                learned_actions = sorted(list(label_map.keys()))
            print(f"✅ Loaded label map from {LABEL_MAP_PATH}.")
            print(f"Identified {len(learned_actions)} learned actions: {learned_actions}")
        except Exception as e:
            print(f"❌ Error loading label map from {LABEL_MAP_PATH}: {e}")
            print("Cannot proceed without a valid label map. Exiting.")
            return
    else:
        print(f"❌ Error: Label map not found at {LABEL_MAP_PATH}.")
        print("Please ensure your LSTM training script has been run and saved the label map.")
        return

    if not learned_actions:
        print("No learned actions found in the label map. Nothing to move. Exiting.")
        return

    # 2. Create the destination directory if it doesn't exist
    os.makedirs(LEARNED_WORDS_PATH, exist_ok=True)
    print(f"Destination folder '{LEARNED_WORDS_PATH}' ensured.")

    # 3. Iterate through learned actions and move their directories
    moved_count = 0
    skipped_count = 0

    print("\n--- Moving Action Data ---")
    for action in learned_actions:
        source_dir = os.path.join(PROCESSED_PATH, action)
        destination_dir = os.path.join(LEARNED_WORDS_PATH, action)

        if os.path.exists(source_dir) and os.path.isdir(source_dir):
            try:
                print(f"Moving '{action}' from '{source_dir}' to '{destination_dir}'...")
                shutil.move(source_dir, destination_dir)
                moved_count += 1
                print(f"  ✅ Successfully moved '{action}'.")
            except shutil.Error as e:
                print(f"  ❌ Error moving '{action}': {e}. Skipping.")
                skipped_count += 1
            except Exception as e:
                print(f"  ❌ An unexpected error occurred while moving '{action}': {e}. Skipping.")
                skipped_count += 1
        else:
            print(f"  ⚠️ Source directory for '{action}' not found at '{source_dir}'. Skipping.")
            skipped_count += 1
    
    print("\n--- Move Operation Summary ---")
    print(f"Total learned actions in map: {len(learned_actions)}")
    print(f"Successfully moved: {moved_count} directories.")
    print(f"Skipped (not found or error): {skipped_count} directories.")
    print("\n🏁 Learned Words Mover completed.")

if __name__ == '__main__':
    move_learned_words()
