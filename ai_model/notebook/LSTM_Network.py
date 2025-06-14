from Preprocess_Data import load_data
from tensorflow.keras.callbacks import ModelCheckpoint
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import os

# === Configurations ===
DATASET_PATH = 'dataset/ASL_Sign'
MAPPING_PATH = 'dataset/mapping.txt'
SEQUENCE_LENGTH = 30
SAVE_MODEL_PATH = 'action.h5'

# === Load Data ===
(actions, X_train, X_test, y_train, y_test), label_map = load_data(
    dataset_path=DATASET_PATH,
    mapping_path=MAPPING_PATH,
    sequence_length=SEQUENCE_LENGTH
)

# === Define Model ===
def build_lstm_model(input_shape, num_classes):
    model = Sequential()
    model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=input_shape))
    model.add(Dropout(0.5))
    model.add(LSTM(64, return_sequences=False, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(num_classes, activation='softmax'))
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

# === Build and Compile ===
model = build_lstm_model(input_shape=(SEQUENCE_LENGTH, X_train.shape[2]), num_classes=len(actions))

# === Save Best Model During Training ===
checkpoint = ModelCheckpoint(SAVE_MODEL_PATH, monitor='val_accuracy', save_best_only=True, verbose=1)

# === Train ===
model.fit(X_train, y_train,
          validation_data=(X_test, y_test),
          epochs=30,
          batch_size=32,
          callbacks=[checkpoint])

# Save final model
model.save(SAVE_MODEL_PATH)
print(f"✅ Model training complete. Saved as '{SAVE_MODEL_PATH}'")
