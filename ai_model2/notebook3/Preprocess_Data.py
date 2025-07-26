import numpy as np
import os
import random # Import the random module
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical

def load_data(data_path='D:\capstone\msasl_augumented', actions=None, sequence_length=30, test_size=0.2, random_state=42, use_half_npy=False):
    """
    Loads processed keypoint data for specified actions, with an option to use
    only half of the available NPY files per action.

    Args:
        data_path (str): Base path to the processed dataset.
        actions (list, optional): List of action names to load. If None, all folders in data_path are used.
        sequence_length (int): Expected length of each sequence.
        test_size (float): Proportion of the dataset to include in the test split.
        random_state (int): Seed for random operations (used for train_test_split and NPY file sampling).
        use_half_npy (bool): If True, only uses approximately half of the NPY files per action.

    Returns:
        tuple: (X_train, X_test, y_train, y_test)
        dict: label_map mapping action names to integer labels.
    """
    if actions is None:
        actions = sorted([folder for folder in os.listdir(data_path) if os.path.isdir(os.path.join(data_path, folder))])

    print(f"Actions to load: {actions}")

    label_map = {label: num for num, label in enumerate(actions)}
    sequences, labels = [], []

    # Set random seed for NPY file selection to ensure reproducibility
    # It's good that your main script also sets this globally, but repeating it
    # here ensures consistency for this function's internal randomness.
    random.seed(random_state)
    np.random.seed(random_state) # Also set numpy's seed for any numpy-related randomness

    for action in actions:
        action_path = os.path.join(data_path, action)
        
        # Get all NPY files for the current action
        all_npy_files = [f for f in os.listdir(action_path) if f.endswith('.npy')]
        
        selected_npy_files = []
        if use_half_npy:
            # Calculate number of files to use (half, but at least 1)
            num_files_to_use = max(1, len(all_npy_files) // 2)
            # Randomly sample the files
            selected_npy_files = random.sample(all_npy_files, num_files_to_use)
            print(f"For action '{action}', selected {len(selected_npy_files)} out of {len(all_npy_files)} NPY files (half option enabled).")
        else:
            selected_npy_files = all_npy_files
            print(f"For action '{action}', loading all {len(selected_npy_files)} NPY files (half option disabled).")


        action_sequences_loaded = 0

        for file_name in selected_npy_files: # Iterate through the selected files
            file_path = os.path.join(action_path, file_name)
            try:
                sequence = np.load(file_path)

                if sequence.shape[0] != sequence_length:
                    # Print a more informative message about skipping
                    # print(f"Skipping {file_path} due to incorrect length: {sequence.shape[0]} (expected {sequence_length}).")
                    continue # Skip this file if its length is not as expected

                sequences.append(sequence)
                labels.append(label_map[action])
                action_sequences_loaded += 1
            except Exception as e:
                print(f"Error loading {file_path}: {e}")

        print(f"Action '{action}': {action_sequences_loaded} sequences successfully loaded after filtering.")

    if not sequences: # Check if any sequences were loaded at all
        print("Error: No sequences loaded. Check data_path, action names, and NPY file contents.")
        return (np.array([]), np.array([]), np.array([]), np.array([])), {}


    X = np.array(sequences)
    y = to_categorical(labels).astype(int)

    print(f"\nDataset Summary (After Loading and Filtering):")
    print(f"X shape: {X.shape}")
    print(f"y shape: {y.shape}")
    print(f"Unique labels: {np.unique(labels)}")
    print(f"Label distribution: {np.bincount(labels)}") # This will now reflect the count after sampling
    print(f"Data range: [{X.min():.4f}, {X.max():.4f}]")
    print(f"Data mean: {X.mean():.4f}, std: {X.std():.4f}")

    # Check for data issues
    if np.any(np.isnan(X)):
        print("WARNING: NaN values found in data!")
    if np.any(np.isinf(X)):
        print("WARNING: Infinite values found in data!")

    # Ensure there's enough data to split
    if X.shape[0] < 2 or len(np.unique(labels)) < 2:
        print("WARNING: Not enough samples or unique classes to perform a stratified train-test split. Returning all data as training data.")
        return (X, np.array([]), y, np.array([])), label_map # Return empty test sets

    return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=labels), label_map