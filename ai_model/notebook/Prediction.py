from tensorflow.keras.models import load_model
import numpy as np
from Preprocess_Data import load_data

# Define actions
actions = ['hello', 'thanks', 'iloveyou']

# Load data
(X_train, X_test, y_train, y_test), _ = load_data(actions=actions)

# Load the full model
model = load_model('action.h5')

# Make a prediction
res = model.predict(X_test)
print("Prediction:", actions[np.argmax(res[4])])
print("True Label:", actions[np.argmax(y_test[4])])
