import os
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.metrics import multilabel_confusion_matrix, accuracy_score
from Preprocess_Data import load_data

# Path to your processed data
PROCESSED_PATH = os.path.join('processed_dataset')

# Automatically detect actions
actions = sorted([
    d for d in os.listdir(PROCESSED_PATH)
    if os.path.isdir(os.path.join(PROCESSED_PATH, d))
])
print("Detected actions:", actions)

# Load data
(_, X_test, _, y_test), label_map = load_data(data_path=PROCESSED_PATH)

# Load trained model
model = load_model('action.h5')

# Predict
y_pred = model.predict(X_test)

# Convert predictions and true labels to class indices
y_true = np.argmax(y_test, axis=1)
y_pred = np.argmax(y_pred, axis=1)

# Confusion matrix and accuracy
conf_matrix = multilabel_confusion_matrix(y_true, y_pred)
acc_score = accuracy_score(y_true, y_pred)

# Output
print("\n✅ Confusion Matrix (per class):")
for idx, matrix in enumerate(conf_matrix):
    print(f"\nClass '{actions[idx]}'")
    print(matrix)

print(f"\n✅ Accuracy Score: {acc_score:.4f}")
