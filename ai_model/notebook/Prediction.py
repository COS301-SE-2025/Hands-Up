from tensorflow.keras.models import load_model
import numpy as np
import json
from Preprocess_Data import load_data

# Load mapping from class index to phrase
with open('dataset/mapping.txt', 'r') as f:
    class_map = json.load(f)

# Convert keys from string to int
class_map = {int(k): v for k, v in class_map.items()}

# Load data
(X_train, X_test, y_train, y_test), _ = load_data()

# Load the trained model
model = load_model('action.h5')

# Predict and compare for a few test samples
num_samples_to_check = 5
for i in range(min(num_samples_to_check, len(X_test))):
    input_sample = np.expand_dims(X_test[i], axis=0)  # Add batch dimension
    prediction = model.predict(input_sample)[0]
    predicted_index = np.argmax(prediction)
    true_index = np.argmax(y_test[i])

    predicted_label = class_map.get(predicted_index, f"Unknown ({predicted_index})")
    true_label = class_map.get(true_index, f"Unknown ({true_index})")

    print(f"Sample {i + 1}:")
    print(f"  Prediction : {predicted_label} (Confidence: {np.max(prediction):.2f})")
    print(f"  True Label : {true_label}")
    print("-" * 40)
