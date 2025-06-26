import os
import numpy as np
import pickle
from tensorflow.keras.models import load_model
import random
import argparse # Added for command-line argument parsing

# --- Configuration Constants (must match your training script) ---
MODEL_PATH = 'action_model.h5'
NORMALIZATION_PARAMS_PATH = 'normalization_params.npy'
LABEL_MAP_PATH = 'label_map.pkl'

# --- Load Model, Normalization Params, and Label Map once at startup ---
# These are loaded globally or as part of a class initialization for efficiency
model = None
X_mean, X_std = 0, 1 # Fallback defaults
actions = []
label_map = {}
reversed_label_map = {}

try:
    model = load_model(MODEL_PATH)
    print(f"Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model from {MODEL_PATH}: {e}. Predictions will not be possible.")

try:
    X_mean, X_std = np.load(NORMALIZATION_PARAMS_PATH)
    print(f"Normalization parameters loaded from {NORMALIZATION_PARAMS_PATH}")
except Exception as e:
    print(f"Error loading normalization parameters from {NORMALIZATION_PARAMS_PATH}: {e}. Predictions may be inaccurate.")
    X_mean, X_std = 0, 1 # Fallback to no normalization if params not found

try:
    with open(LABEL_MAP_PATH, 'rb') as f:
        label_map = pickle.load(f)
    actions = sorted(list(label_map.keys()))
    reversed_label_map = {v: k for k, v in label_map.items()}
    print(f"Label map loaded with {len(actions)} actions: {actions}.")
except Exception as e:
    print(f"Error loading label map from {LABEL_MAP_PATH}: {e}. Cannot map predictions to action names.")
    actions = [] # Fallback
    reversed_label_map = {}


def predict_single_sequence(keypoint_sequence_data, source_info="unknown"):
    """
    Performs a prediction on a single sequence of keypoint data and returns the
    predicted action and its confidence.

    Args:
        keypoint_sequence_data (np.array): A single sequence of keypoints,
                                            e.g., shape (sequence_length, num_features).
                                            Expected to be raw, unnormalized data.
        source_info (str): Optional information about the source of the data (e.g., filename, true action).

    Returns:
        tuple: (predicted_action_name, confidence, all_predictions_dict)
               Returns (None, 0.0, {}) if model or params are not loaded.
    """
    if model is None or X_mean is None or X_std is None or not actions:
        print("Model or necessary parameters not loaded. Cannot predict.", flush=True)
        return None, 0.0, {}

    if keypoint_sequence_data.ndim != 2:
        print(f"Error: Expected 2D keypoint_sequence_data (sequence_length, num_features), but got shape {keypoint_sequence_data.shape}. Skipping prediction for '{source_info}'.", flush=True)
        return None, 0.0, {}

    # 1. Reshape for model input (batch_size, sequence_length, num_features)
    input_data = np.expand_dims(keypoint_sequence_data, axis=0) # Add batch dimension

    # 2. Apply normalization
    input_data_norm = (input_data - X_mean) / (X_std + 1e-8)

    # 3. Make prediction to get probability distribution
    try:
        raw_predictions = model.predict(input_data_norm, verbose=0)[0] 
    except Exception as e:
        print(f"Error during model prediction for '{source_info}': {e}. Skipping.", flush=True)
        return None, 0.0, {}

    # 4. Get the predicted class (highest probability)
    predicted_index = np.argmax(raw_predictions)
    predicted_action = reversed_label_map.get(predicted_index, "UNKNOWN")
    confidence = float(raw_predictions[predicted_index])
    
    # Return all predictions as a dictionary for more insight
    all_predictions_dict = {
        reversed_label_map.get(i, f"UNKNOWN_{i}"): float(raw_predictions[i])
        for i in range(len(raw_predictions))
    }

    return predicted_action, confidence, all_predictions_dict


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Predict sign language action from an .npy keypoint file or run a batch demonstration.')
    parser.add_argument('--file', type=str, help='Path to a specific .npy keypoint file for prediction.')
    args = parser.parse_args()

    if args.file:
        # User provided a specific .npy file
        file_path = args.file
        print(f"\n--- Predicting for specified file: {file_path} ---")

        if not os.path.exists(file_path):
            print(f"Error: File not found at '{file_path}'. Please check the path.", flush=True)
        elif not file_path.endswith('.npy'):
            print(f"Error: Expected a .npy file, but got '{file_path}'.", flush=True)
        else:
            try:
                sample_data = np.load(file_path)
                predicted_action, confidence, all_preds = predict_single_sequence(sample_data, source_info=file_path)

                if predicted_action:
                    print(f"\nPredicted Action for '{os.path.basename(file_path)}':")
                    print(f"  Action: '{predicted_action}'")
                    print(f"  Confidence: {confidence:.4f}")

                    if confidence > 0.5:
                        print(f"  Model is {confidence*100:.2f}% confident this is '{predicted_action}'.")
                    else:
                        print(f"  Model is not very confident this is '{predicted_action}'.")

                    print("\n  All probabilities:")
                    sorted_preds = sorted(all_preds.items(), key=lambda item: item[1], reverse=True)
                    for word, prob in sorted_preds:
                        print(f"    {word}: {prob:.4f}")
                else:
                    print(f"Could not make a prediction for '{file_path}'. See errors above.", flush=True)

            except Exception as e:
                print(f"Error loading or processing .npy file '{file_path}': {e}", flush=True)
    else:
        # No file specified, run the random sample demonstration
        print(f"\n--- Demonstrating Multiple Predictions from Dataset ---")
        
        all_sample_files = []
        # Collect all .npy files with their true action names
        if os.path.exists('super_augmented_dataset'):
            for action_name in actions:
                action_path = os.path.join('super_augmented_dataset', action_name)
                if os.path.isdir(action_path):
                    npy_files = [f for f in os.listdir(action_path) if f.endswith('.npy')]
                    for npy_file in npy_files:
                        all_sample_files.append((os.path.join(action_path, npy_file), action_name))
        
        if not all_sample_files:
            print("No .npy files found in 'super_augmented_dataset'. Cannot run predictions.", flush=True)
        else:
            # Shuffle samples to get a random mix, then pick a fixed number to display
            random.shuffle(all_sample_files)
            num_samples_to_show = min(20, len(all_sample_files)) # Show up to 20 random samples

            print(f"Showing predictions for {num_samples_to_show} random samples from the dataset:", flush=True)

            for i in range(num_samples_to_show):
                file_path, true_action_name = all_sample_files[i]
                
                try:
                    sample_data = np.load(file_path)
                except Exception as e:
                    print(f"Error loading sample {file_path}: {e}. Skipping.", flush=True)
                    continue

                # Call predict_single_sequence
                predicted_action, confidence, all_preds = predict_single_sequence(sample_data, source_info=f"sample {i+1} (True: {true_action_name})") 
                
                if predicted_action:
                    print(f"\nSample {i+1}:")
                    print(f"  True Action: '{true_action_name}'")
                    print(f"  Predicted Action: '{predicted_action}' with Confidence: {confidence:.4f}")

                    is_correct = (predicted_action == true_action_name)
                    print(f"  Prediction Correct: {is_correct}")

                    # Uncomment the following lines if you want to see all probabilities for each sample
                    # print("  All probabilities:")
                    # sorted_preds = sorted(all_preds.items(), key=lambda item: item[1], reverse=True)
                    # for word, prob in sorted_preds:
                    #     print(f"    {word}: {prob:.4f}")
                else:
                    print(f"\nSample {i+1}: Could not make a prediction for '{file_path}'.", flush=True)
