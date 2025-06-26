import numpy as np
import os
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical

def load_data(data_path='super_augmented_dataset', actions=None, sequence_length=30, test_size=0.2, random_state=42):
    if actions is None:
        actions = sorted([folder for folder in os.listdir(data_path) if os.path.isdir(os.path.join(data_path, folder))])
    
    print(f"Actions found: {actions}")
    
    label_map = {label: num for num, label in enumerate(actions)}
    sequences, labels = [], []

    for action in actions:
        action_path = os.path.join(data_path, action)
        action_sequences = 0
        
        for file in os.listdir(action_path):
            if not file.endswith('.npy'):
                continue
            file_path = os.path.join(action_path, file)
            sequence = np.load(file_path)

            if sequence.shape[0] != sequence_length:
                print(f"Skipping {file_path} due to incorrect length: {sequence.shape[0]}")
                continue

            sequences.append(sequence)
            labels.append(label_map[action])
            action_sequences += 1
        
        print(f"Action '{action}': {action_sequences} sequences loaded")

    X = np.array(sequences)
    y = to_categorical(labels).astype(int)
    
    print(f"\nDataset Summary:")
    print(f"X shape: {X.shape}")
    print(f"y shape: {y.shape}")
    print(f"Unique labels: {np.unique(labels)}")
    print(f"Label distribution: {np.bincount(labels)}")
    print(f"Data range: [{X.min():.4f}, {X.max():.4f}]")
    print(f"Data mean: {X.mean():.4f}, std: {X.std():.4f}")
    
    # Check for data issues
    if np.any(np.isnan(X)):
        print("WARNING: NaN values found in data!")
    if np.any(np.isinf(X)):
        print("WARNING: Infinite values found in data!")
    
    return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=labels), label_map
