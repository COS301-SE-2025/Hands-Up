import os
import numpy as np
import pickle
import random
import time
from sklearn.metrics import multilabel_confusion_matrix, accuracy_score

from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import TensorBoard, EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam

# Assuming Preprocess_Data.py is in the same directory or accessible via PYTHONPATH
# You would need to ensure Preprocess_Data.py is available and contains the load_data function.
# For example, a minimal Preprocess_Data.py might look like this:

from Preprocess_Data import load_data 

# --- Configuration Constants ---
PROCESSED_PATH = 'super_augmented_dataset' # Base path for your processed keypoint data
MODEL_PATH = 'action_model.h5'             # Path to save/load the trained model
NORMALIZATION_PARAMS_PATH = 'normalization_params.npy' # Path for saving/loading normalization parameters
LABEL_MAP_PATH = 'label_map.pkl'           # Path for saving/loading the action-label mapping

TARGET_ACCURACY_THRESHOLD = 0.85           # 85% accuracy threshold as requested
INCREMENTAL_EPOCHS = 30                    # Number of epochs for incremental training
BATCH_SIZE = 32                            # Training batch size
PATIENCE_EARLY_STOPPING = 10               # Patience for EarlyStopping callback
PATIENCE_REDUCE_LR = 5                     # Patience for ReduceLROnPlateau callback
MIN_LR = 1e-7                              # Minimum learning rate
LR_FACTOR = 0.5                            # Factor by which the learning rate will be reduced
NEW_ACTIONS_PER_STEP_MIN = 1               # Minimum new actions to add per step
NEW_ACTIONS_PER_STEP_MAX = 3               # Maximum new actions to add per step
INITIAL_LEARNING_RATE = 0.001              # Initial learning rate for Adam optimizer
INITIAL_ACTIONS_COUNT = 5                  # Start with 5 actions as requested

# --- Model Architecture Definition ---
def build_model(input_shape, num_classes):
    """
    Builds the LSTM model architecture.
    
    Args:
        input_shape (tuple): Shape of the input data (sequence_length, num_features).
        num_classes (int): The number of output classes for the final Dense layer.
    
    Returns:
        tensorflow.keras.Model: Compiled Keras Sequential model.
    """
    model = Sequential([
        # First LSTM layer: 64 units, returns sequences for the next LSTM layer
        # Uses tanh activation, suitable for LSTM gates, and takes the input shape.
        LSTM(64, return_sequences=True, activation='tanh', input_shape=input_shape, name='lstm_1'),
        Dropout(0.2, name='dropout_1'), # Dropout for regularization
        BatchNormalization(name='batch_norm_1'), # Batch Normalization for stability and speed

        # Second LSTM layer: 128 units, returns sequences for the subsequent LSTM layer
        LSTM(128, return_sequences=True, activation='tanh', name='lstm_2'),
        Dropout(0.2, name='dropout_2'),
        BatchNormalization(name='batch_norm_2'),
        
        # Third LSTM layer: 64 units, does not return sequences as it's the last LSTM layer
        # Its output will be fed into the Dense layers.
        LSTM(64, return_sequences=False, activation='tanh', name='lstm_3'),
        Dropout(0.3, name='dropout_3'),
        BatchNormalization(name='batch_norm_3'),
        
        # First Dense layer: 64 units, ReLU activation for non-linearity
        Dense(64, activation='relu', name='dense_1'),
        Dropout(0.4, name='dropout_4'),
        BatchNormalization(name='batch_norm_4'),
        
        # Second Dense layer: 32 units, ReLU activation
        Dense(32, activation='relu', name='dense_2'),
        Dropout(0.3, name='dropout_5'),
        
        # Output Dense layer: 'num_classes' units, softmax activation for multi-class classification.
        # Softmax ensures that the outputs are probabilities summing to 1.
        Dense(num_classes, activation='softmax', name='output_dense')
    ])
    return model

def evaluate_model_accuracy(model, X_test_norm, y_test, actions, label_map):
    """
    Evaluates the model using multilabel confusion matrix and accuracy score.
    Prints per-class confusion matrices and sample predictions for qualitative assessment.
    
    Args:
        model: Trained Keras model.
        X_test_norm: Normalized test data (numpy array).
        y_test: True labels (one-hot encoded numpy array).
        actions: List of action names corresponding to the labels.
        label_map: Dictionary mapping action names to integer indices.
        
    Returns:
        float: Overall accuracy score.
    """
    print("\n--- Evaluating Model Performance ---")
    
    # Make predictions on the normalized test data
    y_pred_raw = model.predict(X_test_norm, verbose=0)
    
    # Convert predictions from probabilities to class indices by taking the argmax
    y_pred_indices = np.argmax(y_pred_raw, axis=1)
    # Convert true labels from one-hot encoded to class indices
    y_true_indices = np.argmax(y_test, axis=1)
    
    # Calculate multilabel confusion matrix. This provides a confusion matrix for each class.
    conf_matrix = multilabel_confusion_matrix(y_true_indices, y_pred_indices)
    # Calculate overall accuracy score
    acc_score = accuracy_score(y_true_indices, y_pred_indices)
    
    # Display confusion matrix for each class using the requested format
    print("\n✅ Confusion Matrix (per class):")
    for idx, matrix in enumerate(conf_matrix):
        # Ensure the index is within the bounds of the actions list
        if idx < len(actions):
            print(f"\nClass '{actions[idx]}'") # Updated print format
            print(matrix) # Print the 2x2 confusion matrix for the current class
    
    print(f"\n✅ Accuracy Score: {acc_score:.4f}") # Updated print format
    
    # Show sample predictions for debugging and qualitative analysis (retained for usefulness)
    print("\n--- Sample Predictions ---")
    # Create a reversed label map to convert indices back to action names
    reversed_label_map = {v: k for k, v in label_map.items()}
    # Determine the number of samples to display (minimum of 3 or total test samples)
    num_samples = min(3, len(y_test))
    
    for i in range(num_samples):
        # Get true and predicted action names
        true_action = reversed_label_map.get(y_true_indices[i], "UNKNOWN")
        predicted_action = reversed_label_map.get(y_pred_indices[i], "UNKNOWN")
        # Get the confidence for the predicted class
        confidence = y_pred_raw[i][y_pred_indices[i]]
        
        # Print sample prediction details
        print(f"Sample {i+1}: True={true_action}, Predicted={predicted_action}, "
              f"Confidence={confidence:.4f}, Correct={true_action == predicted_action}")
    
    return acc_score

def transfer_weights_to_new_model(old_model, new_model):
    """
    Transfers weights from an old Keras model to a new Keras model.
    This is useful when changing the number of output classes.
    Weights are transferred for all layers except the last (output) layer.
    
    Args:
        old_model: The previously trained Keras model.
        new_model: The new Keras model with the updated architecture (potentially different output layer).
    """
    print("Transferring weights from previous model...")
    transferred_layers = 0
    
    # Iterate through layers of the old model, excluding the last layer (output layer).
    # The output layer typically changes size when adding new classes.
    for i in range(len(old_model.layers) - 1):
        # Ensure the new model has a corresponding layer at this index.
        if i < len(new_model.layers) - 1:
            try:
                # Set the weights of the new layer from the old layer.
                new_model.layers[i].set_weights(old_model.layers[i].get_weights())
                transferred_layers += 1
            except Exception as e:
                # Catch exceptions if weight shapes don't match or other issues occur.
                print(f"Warning: Could not transfer weights for layer {i} ({old_model.layers[i].name}): {e}")
    
    print(f"Successfully transferred weights for {transferred_layers} layers.")

def run_incremental_learning():
    """
    Main incremental learning pipeline.
    It starts with a small subset of actions, trains the model, and if accuracy
    is sufficient, it adds more actions and continues training.
    """
    print("=== Starting Incremental LSTM Learning Pipeline ===")
    print(f"Target accuracy threshold: {TARGET_ACCURACY_THRESHOLD*100}%")
    print(f"Will add {NEW_ACTIONS_PER_STEP_MIN}-{NEW_ACTIONS_PER_STEP_MAX} actions per successful iteration")
    
    # Get all available action folder names from the processed dataset directory
    all_possible_actions = sorted([
        d for d in os.listdir(PROCESSED_PATH)
        if os.path.isdir(os.path.join(PROCESSED_PATH, d))
    ])
    
    if not all_possible_actions:
        print(f"Error: No action folders found in {PROCESSED_PATH}. Please ensure your data is prepared.")
        return
    
    print(f"Found {len(all_possible_actions)} total actions: {all_possible_actions}")
    
    # Initialize variables for the current state of the learning process
    current_actions = [] # List of actions currently being trained on
    model = None         # The Keras model
    X_mean, X_std = None, None # Normalization parameters
    
    # Try to load existing state from previous runs (model, label map, normalization params)
    if (os.path.exists(MODEL_PATH) and 
        os.path.exists(LABEL_MAP_PATH) and 
        os.path.exists(NORMALIZATION_PARAMS_PATH)):
        
        try:
            # Load the label map to restore the list of current actions
            with open(LABEL_MAP_PATH, 'rb') as f:
                loaded_label_map = pickle.load(f)
                current_actions = sorted(list(loaded_label_map.keys()))
            
            # Load the normalization parameters
            X_mean, X_std = np.load(NORMALIZATION_PARAMS_PATH)
            print(f"✅ Loaded existing state with {len(current_actions)} actions: {current_actions}")
            
        except Exception as e:
            # If loading fails, print an error and start fresh
            print(f"⚠️ Error loading existing state: {e}")
            print("Starting fresh...")
            current_actions = [] # Reset to empty to trigger fresh start
    
    # If no existing state was loaded successfully or if it's the very first run,
    # initialize with a predefined number of initial actions.
    if not current_actions:
        initial_count = min(INITIAL_ACTIONS_COUNT, len(all_possible_actions))
        current_actions = all_possible_actions[:initial_count]
        print(f"🚀 Starting fresh with {initial_count} actions: {current_actions}")
    
    # Main learning loop: continues until all possible actions are learned
    iteration = 0
    while len(current_actions) < len(all_possible_actions):
        iteration += 1
        print(f"\n{'='*60}")
        print(f"LEARNING ITERATION {iteration}")
        print(f"Current actions ({len(current_actions)}): {current_actions}")
        print(f"{'='*60}")
        
        # Load data for the current set of actions
        try:
            (X_train, X_test, y_train, y_test), label_map = load_data(
                data_path=PROCESSED_PATH, 
                actions=current_actions
            )
        except Exception as e:
            print(f"Error loading data: {e}. Please check 'Preprocess_Data.py' and data path.")
            break # Exit if data loading fails
        
        if X_train.shape[0] == 0:
            print("No training data found for current actions. Exiting.")
            break # Exit if no training data
        
        # Calculate normalization parameters (mean and standard deviation) from the training data
        X_mean_current = X_train.mean()
        X_std_current = X_train.std()
        
        # Apply normalization to both training and testing data
        # Add a small epsilon (1e-8) to std to prevent division by zero for constant features.
        X_train_norm = (X_train - X_mean_current) / (X_std_current + 1e-8)
        X_test_norm = (X_test - X_mean_current) / (X_std_current + 1e-8)
        
        # Define input shape for the model (sequence_length, num_features)
        input_shape = (X_train.shape[1], X_train.shape[2])
        # Define the number of output classes based on the current label map
        num_classes = len(label_map)
        
        # --- Handle model creation/adaptation for each iteration ---
        # Get the number of output classes from the current model's last layer's units
        # This is more robust as Dense layers always have a 'units' attribute after initialization.
        current_model_num_classes = model.layers[-1].units if model and isinstance(model.layers[-1], Dense) else 0

        # Check if model needs to be built or adapted based on the number of classes
        if model is None or current_model_num_classes != num_classes:
            print(f"🔄 Model adaptation needed: Old classes={current_model_num_classes}, New classes={num_classes}")
            if model is not None: # If an old model exists from a previous iteration or loaded, attempt to transfer weights
                old_model = model # Store reference to the existing model before creating a new one
                model = build_model(input_shape, num_classes) # Build a new model with the correct output size
                transfer_weights_to_new_model(old_model, model) # Transfer weights from the old model
            else: # This branch is for the very first time building the model (model is None)
                model = build_model(input_shape, num_classes)
                print("🏗️ Built new model from scratch.")
        else:
            print("✅ Model architecture matches current number of classes. Recompiling existing model.")
            
        # Always compile the model with the correct number of classes for the current iteration
        model.compile(
            optimizer=Adam(learning_rate=INITIAL_LEARNING_RATE),
            loss='categorical_crossentropy',
            metrics=['categorical_accuracy']
        )
        
        print(f"📊 Model summary: Input shape {input_shape}, Output classes {num_classes}")
        
        # --- Model Training ---
        print(f"\n🎯 Training model on {len(current_actions)} actions...")
        
        # Define callbacks for training:
        callbacks = [
            # TensorBoard for visualization of training progress
            TensorBoard(log_dir=f'Logs/incremental_iter_{iteration}_{time.strftime("%Y%m%d-%H%M%S")}'),
            # EarlyStopping to stop training if validation loss doesn't improve
            EarlyStopping(patience=PATIENCE_EARLY_STOPPING, restore_best_weights=True, monitor='val_loss'),
            # ReduceLROnPlateau to reduce learning rate when validation loss plateaus
            ReduceLROnPlateau(patience=PATIENCE_REDUCE_LR, factor=LR_FACTOR, min_lr=MIN_LR, monitor='val_loss')
        ]
        
        # Fit the model to the training data
        history = model.fit(
            X_train_norm, y_train,
            validation_data=(X_test_norm, y_test), # Use test data for validation
            epochs=INCREMENTAL_EPOCHS,
            batch_size=BATCH_SIZE,
            callbacks=callbacks,
            verbose=1 # Show progress during training
        )
        
        # Evaluate the model using the custom evaluation function
        accuracy = evaluate_model_accuracy(model, X_test_norm, y_test, current_actions, label_map)
        
        # Save the current state of the model, normalization parameters, and label map
        model.save(MODEL_PATH)
        np.save(NORMALIZATION_PARAMS_PATH, [X_mean_current, X_std_current])
        with open(LABEL_MAP_PATH, 'wb') as f:
            pickle.dump(label_map, f)
        print("💾 Model and parameters saved successfully.")
        
        # Determine remaining actions that haven't been added yet
        remaining_actions = [a for a in all_possible_actions if a not in current_actions]
        
        # Decision logic for adding new actions or continuing training on current set
        if accuracy >= TARGET_ACCURACY_THRESHOLD:
            if remaining_actions:
                # If accuracy is sufficient and there are more actions to add, add them.
                num_to_add = random.randint(NEW_ACTIONS_PER_STEP_MIN, NEW_ACTIONS_PER_STEP_MAX)
                num_to_add = min(num_to_add, len(remaining_actions)) # Don't exceed available actions
                
                new_actions = random.sample(remaining_actions, num_to_add) # Randomly select new actions
                current_actions.extend(new_actions) # Add them to the current list
                current_actions = sorted(current_actions) # Keep the list sorted for consistency
                
                print(f"\n✅ Accuracy {accuracy:.4f} >= {TARGET_ACCURACY_THRESHOLD:.4f}")
                print(f"🎉 Adding {num_to_add} new actions: {new_actions}")
                print(f"📈 Total actions for next iteration: {len(current_actions)}")
                
            else:
                # All actions have been learned, exit the loop.
                print(f"\n🎊 ALL ACTIONS LEARNED! Final accuracy: {accuracy:.4f}")
                break
        else:
            # If accuracy is below threshold, continue training on the same set of actions.
            print(f"\n⏳ Accuracy {accuracy:.4f} < {TARGET_ACCURACY_THRESHOLD:.4f}")
            print("🔄 Need to improve on current actions before adding new ones.")
            print("Continuing training with same action set...")
    
    print(f"\n🏁 Incremental learning completed!")
    print(f"📊 Final model trained on {len(current_actions)} actions.")
    print(f"💾 Model saved as: {MODEL_PATH}")

if __name__ == '__main__':
    run_incremental_learning()