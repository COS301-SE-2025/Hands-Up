import numpy as np
from tensorflow.keras.models import load_model
from sklearn.metrics import multilabel_confusion_matrix, accuracy_score
from Preprocess_Data import load_data

# Define your actions (must match the training phase)
actions = ['hello', 'thanks', 'iloveyou']

# Load data
(_, X_test, _, y_test), _ = load_data(actions=actions)

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
print("✅ Confusion Matrix (per class):")
for idx, matrix in enumerate(conf_matrix):
    print(f"\nClass '{actions[idx]}'")
    print(matrix)

print(f"\n✅ Accuracy Score: {acc_score:.4f}")
