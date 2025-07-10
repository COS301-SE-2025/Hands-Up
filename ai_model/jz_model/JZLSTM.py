import os
import pickle
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import TensorBoard
from tensorflow.keras.utils import to_categorical
from sklearn.metrics import accuracy_score

DATADIR = os.path.join('J_Z')
actions = ['J','Z']
sequenceLength = 20

x, y = [], []

for action in actions:
    actionPath = os.path.join(DATADIR, action)
    
    for sequence in os.listdir(actionPath):
        sequencePath = os.path.join(actionPath, sequence)
        frames = sorted(os.listdir(sequencePath), key=lambda x: int(os.path.splitext(x)[0]))

        if len(frames) < sequenceLength:
            continue

        sequenceData = []
        for frame in frames[:sequenceLength]:
            framePath = os.path.join(sequencePath, frame)
            keypoints = np.load(framePath)
            keypoints = keypoints[:63]
            sequenceData.append(keypoints)
            
        x.append(sequenceData)
        y.append(action)

x = np.array(x)
y = np.array(y)

featureLength = x.shape[2]

labelEncoder = LabelEncoder()
yInt = labelEncoder.fit_transform(y)
yCategorical = to_categorical(yInt)

with open("labelEncoder.pickle", "wb") as f:
    pickle.dump(labelEncoder, f)

print("Label mapping:")
for i, label in enumerate(labelEncoder.classes_):
    print(f"{i}: {label}")

XTrain, XTest, yTrain, yTest = train_test_split(x, yCategorical, test_size=0.2, random_state=42)

# logDir = os.path.join('Logs')
# tbCallback = TensorBoard(log_dir=logDir)

model = Sequential([
    tf.keras.Input(shape=(sequenceLength, featureLength)),
    LSTM(64, return_sequences=True, activation='relu'),
    LSTM(128, return_sequences=True, activation='relu'),
    LSTM(64, return_sequences=False, activation='relu'),
    Dense(64, activation='relu'),
    Dense(32, activation='relu'),
    Dense(yCategorical.shape[1], activation='softmax')
])

model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])

model.fit(XTrain, yTrain, epochs=30)

model.summary()

model.save('JZModel.keras')

yPred = model.predict(XTest)
predictedInts = np.argmax(yPred, axis=1)
actualInts = np.argmax(yTest, axis=1)

predictedLabels = labelEncoder.inverse_transform(predictedInts)
actualLabels = labelEncoder.inverse_transform(actualInts)

print("Test Accuracy:", accuracy_score(actualLabels, predictedLabels))
