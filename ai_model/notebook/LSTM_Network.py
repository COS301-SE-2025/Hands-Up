import os
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import TensorBoard
from Preprocess_Data import load_data

# Define your actions
actions = ['hello', 'thanks', 'iloveyou']

# Load data
(X_train, X_test, y_train, y_test), label_map = load_data(actions=actions)

# TensorBoard callback
log_dir = os.path.join('Logs')
tb_callback = TensorBoard(log_dir=log_dir)

# Build model
model = Sequential()
model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(30, 1662)))
model.add(LSTM(128, return_sequences=True, activation='relu'))
model.add(LSTM(64, return_sequences=False, activation='relu'))
model.add(Dense(64, activation='relu'))
model.add(Dense(32, activation='relu'))
model.add(Dense(len(actions), activation='softmax'))  # use len(actions)

# Compile model
model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])

# Train model
model.fit(X_train, y_train, epochs=2000, callbacks=[tb_callback])

# Save the model after training
model.save('action.h5')
print("✅ Model saved as 'action.h5'")

# Summary
model.summary()
