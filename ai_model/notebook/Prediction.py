import numpy as np
from tensorflow.keras.models import load_model
from Preprocess_Data import load_data
import os

# Path where processed keypoints are stored
PROCESSED_PATH = 'processed_dataset'

# Get actions dynamically from folder names inside PROCESSED_PATH
actions = sorted([folder for folder in os.listdir(PROCESSED_PATH) if os.path.isdir(os.path.join(PROCESSED_PATH, folder))])
print("Detected actions:", actions)

# Load data using detected actions
(X_train, X_test, y_train, y_test), _ = load_data(data_path=PROCESSED_PATH, actions=actions)

# Load your trained model
model = load_model('action_model.h5')

# Predict on test data
res = model.predict(X_test)

# If you want to print one sample's prediction (e.g., the first)
print("Predicted:", actions[np.argmax(res[0])])
print("Actual:   ", actions[np.argmax(y_test[0])])

# Or loop through all predictions (optional)
for i in range(len(res)):
    print(f"Sample {i} - Predicted: {actions[np.argmax(res[i])]}, Actual: {actions[np.argmax(y_test[i])]}")
