import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split 
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Bidirectional, LSTM, Dense, Dropout, BatchNormalization 
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.regularizers import l2 
from tqdm import tqdm 

# --- Configuration (match with previous steps and new model params) ---
PROCESSED_DATA_CSV = 'wlasl_10_words_final_processed_data_augmented_seq90.csv' # Should be correct
PROCESSED_SEQUENCES_DIR = 'processed_sequences' 
MODEL_SAVE_DIR = 'saved_models' 

SEQUENCE_LENGTH = 90 # Should be correct
EXPECTED_COORDS_PER_FRAME = 1662 

# --- Model Hyperparameters ---
LSTM_UNITS = 64 # For Bidirectional LSTMs
DENSE_UNITS = 128 
DROPOUT_RATE = 0.5 
LEARNING_RATE = 0.0005
BATCH_SIZE = 32 
EPOCHS = 100 

def load_data(df):
    """Loads processed landmark sequences and their corresponding labels."""
    X = [] 
    y = [] 

    for index, row in tqdm(df.iterrows(), total=len(df), desc="Loading processed data"):
        seq_path = row['processed_path']
        gloss_id = row['gloss_id']

        try:
            sequence = np.load(seq_path)
            if sequence.shape == (SEQUENCE_LENGTH, EXPECTED_COORDS_PER_FRAME):
                X.append(sequence)
                y.append(gloss_id)
            else:
                print(f"Warning: Skipping {seq_path} due to incorrect shape: {sequence.shape}. Expected ({SEQUENCE_LENGTH}, {EXPECTED_COORDS_PER_FRAME})")
        except Exception as e:
            print(f"Error loading {seq_path}: {e}. Skipping.")

    return np.array(X), np.array(y)

def build_lstm_model(input_shape, num_classes, lstm_units, dense_units, dropout_rate, learning_rate):
    model = Sequential([
        Bidirectional(LSTM(lstm_units, return_sequences=True, activation='tanh'), input_shape=input_shape),
        BatchNormalization(), 
        Dropout(dropout_rate),

        Bidirectional(LSTM(lstm_units, return_sequences=False, activation='tanh')),
        BatchNormalization(), 
        Dropout(dropout_rate),

        Dense(dense_units, activation='relu', kernel_regularizer=l2(0.001)),
        BatchNormalization(), 
        Dropout(dropout_rate),

        Dense(num_classes, activation='softmax', kernel_regularizer=l2(0.001))
    ])

    optimizer = Adam(learning_rate=learning_rate)
    model.compile(optimizer=optimizer, loss='categorical_crossentropy', metrics=['accuracy'])
    return model

if __name__ == "__main__":
    os.makedirs(MODEL_SAVE_DIR, exist_ok=True)

    if not os.path.exists(PROCESSED_DATA_CSV):
        print(f"Error: Processed data metadata CSV not found at {PROCESSED_DATA_CSV}.")
        print("Please ensure data_preprocessor.py has been run to create this file (for your fixed list, sequence 90).") 
        exit()

    df_final = pd.read_csv(PROCESSED_DATA_CSV)
    print(f"Loaded {len(df_final)} entries from {PROCESSED_DATA_CSV}")

    train_df = df_final[df_final['split'] == 'train']
    val_df = df_final[df_final['split'] == 'val']
    test_df = df_final[df_final['split'] == 'test']

    print(f"Train samples (including augmented): {len(train_df)}")
    print(f"Validation samples: {len(val_df)}")
    print(f"Test samples: {len(test_df)}") 

    X_train, y_train_ids = load_data(train_df)
    X_val, y_val_ids = load_data(val_df)
    X_test, y_test_ids = load_data(test_df)

    print(f"\nLoaded data shapes:")
    print(f"X_train: {X_train.shape}, y_train: {y_train_ids.shape}")
    print(f"X_val: {X_val.shape}, y_val: {y_val_ids.shape}")
    print(f"X_test: {X_test.shape}, y_test: {y_test_ids.shape}")

    num_classes = df_final['gloss_id'].nunique()
    print(f"Number of unique classes: {num_classes}")

    y_train = to_categorical(y_train_ids, num_classes=num_classes)
    y_val = to_categorical(y_val_ids, num_classes=num_classes)
    y_test = to_categorical(y_test_ids, num_classes=num_classes) 

    print(f"y_train (one-hot) shape: {y_train.shape}")
    print(f"y_val (one-hot) shape: {y_val.shape}")

    model = build_lstm_model(
        input_shape=(SEQUENCE_LENGTH, EXPECTED_COORDS_PER_FRAME),
        num_classes=num_classes,
        lstm_units=LSTM_UNITS,
        dense_units=DENSE_UNITS,
        dropout_rate=DROPOUT_RATE,
        learning_rate=LEARNING_RATE
    )
    model.summary()

    early_stopping = EarlyStopping(monitor='val_accuracy', patience=20, restore_best_weights=True)
    checkpoint_filepath = os.path.join(MODEL_SAVE_DIR, 'best_sign_classifier_model_10_words_combined_seq90.keras') # <-- CHANGED MODEL SAVE FILENAME
    model_checkpoint = ModelCheckpoint(checkpoint_filepath, monitor='val_accuracy', save_best_only=True, verbose=1)
    reduce_lr = ReduceLROnPlateau(monitor='val_accuracy', factor=0.5, patience=10, min_lr=0.00001, verbose=1)


    print(f"\nStarting model training with BATCH_SIZE={BATCH_SIZE} and EPOCHS={EPOCHS}...")
    history = model.fit(
        X_train, y_train,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        validation_data=(X_val, y_val),
        callbacks=[early_stopping, model_checkpoint, reduce_lr],
        verbose=1
    )

    print("\n--- Training Finished ---")

    if os.path.exists(checkpoint_filepath):
        print(f"Loading best model from: {checkpoint_filepath}")
        model.load_weights(checkpoint_filepath)
    else:
        print(f"Warning: Best model checkpoint not found at {checkpoint_filepath}. Using final trained weights.")

    print("\nEvaluating model on the test set...")
    loss, accuracy = model.evaluate(X_test, y_test, batch_size=BATCH_SIZE, verbose=1)
    print(f"Test Loss: {loss:.4f}")
    print(f"Test Accuracy: {accuracy:.4f}")

    print("\nModel training and evaluation complete.")
    print(f"Best model weights saved to: {checkpoint_filepath}")