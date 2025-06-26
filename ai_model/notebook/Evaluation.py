import os
import numpy as np
import pickle # Added for label_map
from tensorflow.keras.models import load_model
from sklearn.metrics import multilabel_confusion_matrix, accuracy_score

# Assuming Preprocess_Data.py is in the same directory or accessible via PYTHONPATH
from Preprocess_Data import load_data

# --- Configuration Constants (must match your training script) ---
PROCESSED_PATH = 'super_augmented_dataset'
MODEL_PATH = 'action_model.h5'
NORMALIZATION_PARAMS_PATH = 'normalization_params.npy' # Path to saved normalization parameters
LABEL_MAP_PATH = 'label_map.pkl' # Path to saved label map

def run_standalone_evaluation():
    """
    Performs a standalone evaluation of the trained LSTM model.
    It loads the model, normalization parameters, and data, then
    calculates and prints confusion matrices and overall accuracy.
    """
    print("=== Starting Standalone Model Evaluation ===")

    # 1. Load the label map
    label_map = {}
    if os.path.exists(LABEL_MAP_PATH):
        try:
            with open(LABEL_MAP_PATH, 'rb') as f:
                label_map = pickle.load(f)
            actions = sorted(list(label_map.keys())) # Get actions from the loaded label map
            print(f"✅ Loaded label map with {len(actions)} actions: {actions}")
        except Exception as e:
            print(f"❌ Error loading label map from {LABEL_MAP_PATH}: {e}")
            print("Evaluation cannot proceed without valid action names. Exiting.")
            return
    else:
        print(f"❌ Error: Label map not found at {LABEL_MAP_PATH}.")
        print("Please ensure your training script has been run and saved the label map.")
        return

    # 2. Load normalization parameters
    X_mean, X_std = None, None
    if os.path.exists(NORMALIZATION_PARAMS_PATH):
        try:
            X_mean, X_std = np.load(NORMALIZATION_PARAMS_PATH)
            print(f"✅ Loaded normalization parameters from {NORMALIZATION_PARAMS_PATH}.")
        except Exception as e:
            print(f"❌ Error loading normalization parameters from {NORMALIZATION_PARAMS_PATH}: {e}")
            print("Evaluation may be inaccurate without proper normalization. Proceeding with caution.")
    else:
        print(f"❌ Warning: Normalization parameters not found at {NORMALIZATION_PARAMS_PATH}.")
        print("Test data will NOT be normalized, which may lead to inaccurate results.")

    # 3. Load test data
    # Pass the detected actions to load_data to ensure consistent label mapping
    try:
        (_, X_test, _, y_test), _ = load_data(data_path=PROCESSED_PATH, actions=actions)
    except Exception as e:
        print(f"❌ Error loading data from {PROCESSED_PATH}: {e}")
        print("Evaluation cannot proceed without data. Exiting.")
        return

    if X_test.shape[0] == 0:
        print("No test data loaded. Exiting.")
        return

    # 4. Apply normalization to X_test if parameters were loaded
    X_test_norm = X_test
    if X_mean is not None and X_std is not None:
        X_test_norm = (X_test - X_mean) / (X_std + 1e-8)
        print("✅ Test data normalized using loaded parameters.")
    else:
        print("⚠️ Test data not normalized.")

    # 5. Load trained model
    if os.path.exists(MODEL_PATH):
        try:
            model = load_model(MODEL_PATH)
            print(f"✅ Loaded model from {MODEL_PATH}.")
        except Exception as e:
            print(f"❌ Error loading model from {MODEL_PATH}: {e}")
            print("Evaluation cannot proceed without a model. Exiting.")
            return
    else:
        print(f"❌ Error: Model not found at {MODEL_PATH}. Exiting.")
        return

    # 6. Predict
    print("\n--- Making Predictions ---")
    y_pred_raw = model.predict(X_test_norm, verbose=0)

    # Convert predictions and true labels to class indices
    y_true_indices = np.argmax(y_test, axis=1)
    y_pred_indices = np.argmax(y_pred_raw, axis=1)

    # 7. Confusion matrix and accuracy
    conf_matrix = multilabel_confusion_matrix(y_true_indices, y_pred_indices)
    acc_score = accuracy_score(y_true_indices, y_pred_indices)

    # 8. Output results
    print("\n✅ Confusion Matrix (per class):")
    for idx, matrix in enumerate(conf_matrix):
        if idx < len(actions): # Ensure index is valid for actions list
            print(f"\nClass '{actions[idx]}'")
            print(matrix)

    print(f"\n✅ Accuracy Score: {acc_score:.4f}")

    # Show sample predictions for debugging
    print("\n--- Sample Predictions ---")
    reversed_label_map = {v: k for k, v in label_map.items()}
    num_samples = min(3, len(y_test))
    
    for i in range(num_samples):
        true_action = reversed_label_map.get(y_true_indices[i], "UNKNOWN")
        predicted_action = reversed_label_map.get(y_pred_indices[i], "UNKNOWN")
        confidence = y_pred_raw[i][y_pred_indices[i]]
        
        print(f"Sample {i+1}: True={true_action}, Predicted={predicted_action}, "
              f"Confidence={confidence:.4f}, Correct={true_action == predicted_action}")

    print("\n🏁 Standalone Model Evaluation completed.")

if __name__ == '__main__':
    run_standalone_evaluation()
