import numpy as np
import os
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical

def load_data(data_path='data', actions=None, sequence_length=30, test_size=0.05, random_state=42):
    """
    Load and preprocess collected gesture data
    
    Args:
        data_path: Path to the collected data directory
        actions: List of action labels
        sequence_length: Number of frames per sequence
        test_size: Proportion of data for testing
        random_state: Random seed for reproducibility
        
    Returns:
        X_train, X_test, y_train, y_test: Split and preprocessed data
        label_map: Dictionary mapping actions to numeric labels
    """
    if actions is None:
        actions = ['hello', 'thanks', 'iloveyou']  # Default actions
    
    # Create label mapping
    label_map = {label:num for num, label in enumerate(actions)}
    
    sequences, labels = [], []
    
    for action in actions:
        action_path = os.path.join(data_path, action)
        
        # Skip if action folder doesn't exist
        if not os.path.exists(action_path):
            print(f"Warning: Missing action folder - {action_path}")
            continue
            
        # Get all sequence folders (convert to int and sort numerically)
        try:
            sequence_folders = sorted([
                int(seq) for seq in os.listdir(action_path) 
                if os.path.isdir(os.path.join(action_path, str(seq)))
            ])
        except ValueError:
            print(f"Warning: Non-numeric folders in {action_path}")
            continue
            
        for sequence in sequence_folders:
            window = []
            sequence_path = os.path.join(action_path, str(sequence))
            
            # Load all frames in sequence
            for frame_num in range(sequence_length):
                frame_path = os.path.join(sequence_path, f"{frame_num}.npy")
                
                if not os.path.exists(frame_path):
                    print(f"Warning: Missing frame {frame_path}")
                    break  # Skip incomplete sequences
                    
                res = np.load(frame_path)
                window.append(res)
            else:  # Only add complete sequences
                sequences.append(window)
                labels.append(label_map[action])
    
    # Convert to numpy arrays
    X = np.array(sequences)
    y = to_categorical(labels).astype(int)
    
    # Split data
    return train_test_split(X, y, test_size=test_size, random_state=random_state), label_map

if __name__ == "__main__":
    # Example usage
    (X_train, X_test, y_train, y_test), label_map = load_data()
    
    print("\nData Shapes:")
    print(f"X_train: {X_train.shape}")
    print(f"y_train: {y_train.shape}")
    print(f"X_test: {X_test.shape}")
    print(f"y_test: {y_test.shape}")
    print("\nLabel Mapping:", label_map)