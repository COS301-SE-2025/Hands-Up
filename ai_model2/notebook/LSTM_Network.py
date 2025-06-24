import os
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import TensorBoard, EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
from Preprocess_Data import load_data

# Path where your processed keypoints .npy files are saved
PROCESSED_PATH = 'processed_dataset'

# Load data
(X_train, X_test, y_train, y_test), label_map = load_data(data_path=PROCESSED_PATH)

print(f"\nTraining set: {X_train.shape}, {y_train.shape}")
print(f"Test set: {X_test.shape}, {y_test.shape}")

# Data normalization (CRITICAL for LSTM performance)
print("Normalizing data...")
X_mean = X_train.mean()
X_std = X_train.std()
X_train_norm = (X_train - X_mean) / (X_std + 1e-8)
X_test_norm = (X_test - X_mean) / (X_std + 1e-8)

print(f"Normalized data range: [{X_train_norm.min():.4f}, {X_train_norm.max():.4f}]")

# Build improved LSTM model
model = Sequential([
    LSTM(64, return_sequences=True, activation='tanh', input_shape=(30, X_train.shape[2])),
    Dropout(0.2),
    BatchNormalization(),
    
    LSTM(128, return_sequences=True, activation='tanh'),
    Dropout(0.2),
    BatchNormalization(),
    
    LSTM(64, return_sequences=False, activation='tanh'),
    Dropout(0.3),
    BatchNormalization(),
    
    Dense(64, activation='relu'),
    Dropout(0.4),
    BatchNormalization(),
    
    Dense(32, activation='relu'),
    Dropout(0.3),
    
    Dense(len(label_map), activation='softmax')
])

# Compile with proper learning rate
model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['categorical_accuracy']
)

print("\nModel Summary:")
model.summary()

# Callbacks for better training
callbacks = [
    TensorBoard(log_dir='Logs'),
    EarlyStopping(patience=20, restore_best_weights=True, monitor='val_loss'),
    ReduceLROnPlateau(patience=10, factor=0.5, min_lr=1e-7, monitor='val_loss')
]

# Train the model with validation split
print("\nStarting training...")
history = model.fit(
    X_train_norm, y_train,
    validation_data=(X_test_norm, y_test),
    epochs=100,  # Reduced from 2000
    batch_size=32,
    callbacks=callbacks,
    verbose=1
)

# Evaluate the model
print("\nEvaluating model...")
train_loss, train_acc = model.evaluate(X_train_norm, y_train, verbose=0)
test_loss, test_acc = model.evaluate(X_test_norm, y_test, verbose=0)

print(f"Training Accuracy: {train_acc:.4f}")
print(f"Test Accuracy: {test_acc:.4f}")

# Save the model and normalization parameters
model.save('action_model.h5')
np.save('normalization_params.npy', [X_mean, X_std])

# Also save the label_map for prediction
import pickle
with open('label_map.pkl', 'wb') as f:
    pickle.dump(label_map, f)

print("✅ Model, normalization parameters, and label map saved")

# Plot training history
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['categorical_accuracy'], label='Training Accuracy')
plt.plot(history.history['val_categorical_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()

plt.tight_layout()
plt.savefig('training_history.png')
plt.show()

# Test predictions on a few samples for debugging
print("\nTesting predictions on a few samples...")
predictions = model.predict(X_test_norm[:5])
predicted_classes = np.argmax(predictions, axis=1)
actual_classes = np.argmax(y_test[:5], axis=1)

action_names = list(label_map.keys())

print(f"Debug info:")
print(f"Number of classes in model output: {predictions.shape[1]}")
print(f"Number of action names: {len(action_names)}")
print(f"Action names: {action_names}")
print(f"Label map: {label_map}")
print(f"Predicted classes: {predicted_classes}")
print(f"Actual classes: {actual_classes}")
print()

for i in range(min(5, len(predictions))):
    pred_class = predicted_classes[i]
    actual_class = actual_classes[i]
    
    # Safety check for index bounds
    if pred_class < len(action_names) and actual_class < len(action_names):
        print(f"Sample {i+1}:")
        print(f"  Predicted: {action_names[pred_class]} (confidence: {predictions[i][pred_class]:.4f})")
        print(f"  Actual: {action_names[actual_class]}")
        print(f"  Correct: {pred_class == actual_class}")
        print(f"  All prediction scores: {predictions[i]}")
        print()
    else:
        print(f"Sample {i+1}: INDEX ERROR")
        print(f"  Predicted class index: {pred_class} (max allowed: {len(action_names)-1})")
        print(f"  Actual class index: {actual_class} (max allowed: {len(action_names)-1})")
        print(f"  All prediction scores: {predictions[i]}")
        print()

print("Training completed!")