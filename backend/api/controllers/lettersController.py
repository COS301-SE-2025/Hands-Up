import sys
import struct
import cv2
import numpy as np
import pickle
import tensorflow as tf
import mediapipe as mp
import collections
import time
import os
import tensorflow_hub as hub
from collections import deque

model = tf.keras.models.load_model('../../ai_model/models/detectLettersModel.keras')
with open('../../ai_model/models/labelEncoder.pickle', 'rb') as f:
    labelEncoder = pickle.load(f)

# model2 = hub.load("https://www.kaggle.com/models/sayannath235/american-sign-language/TensorFlow2/american-sign-language/1")
# labels = [chr(i) for i in range(ord('A'), ord('Z') + 1)] + ['del', 'nothing', 'space']

model2 = tf.keras.models.load_model('../../ai_model/alphabet_model/JZModel.keras')
with open('../../ai_model/alphabet_model/labelEncoder.pickle', 'rb') as f:
    labelEncoder2 = pickle.load(f)

sequence = deque(maxlen=15)
hands = mp.solutions.hands.Hands(static_image_mode=True)

def detectFromImage(sequenceList):
    if len(sequenceList) != 15:
        return {'letter': '', 'confidence': 0.0}

    processed_sequence = []

    for imagePath in sequenceList:
        image = cv2.imread(imagePath)
        if image is None:
            continue  # Skip invalid or unreadable images

        imgRGB = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(imgRGB)

        if not results.multi_hand_landmarks:
            continue  # No hand found in frame

        handLandmarks = results.multi_hand_landmarks[0]  # Only use the first detected hand

        xList, yList = [], []
        dataAux2 = []

        for lm in handLandmarks.landmark:
            xList.append(lm.x)
            yList.append(lm.y)

        for lm in handLandmarks.landmark:
            dataAux2.append(lm.x - min(xList))
            dataAux2.append(lm.y - min(yList))
            dataAux2.append(0)  # Dummy Z for compatibility

        processed_sequence.append(dataAux2)

    if len(processed_sequence) != 15:
        return {'letter': '', 'confidence': 0.0}  # Incomplete data after filtering

    # Model inference for dynamic signs (J/Z)
    inputData2 = np.array(processed_sequence, dtype=np.float32).reshape(1, 15, 63)
    prediction2 = model2.predict(inputData2, verbose=0)
    index2 = np.argmax(prediction2, axis=1)[0]
    confidence2 = float(np.max(prediction2))
    label2 = labelEncoder2.inverse_transform([index2])[0]

    # Optionally: Use static model for fallback if confidence is low
    fallback_frame = cv2.imread(sequenceList[-1])  # last frame
    if fallback_frame is not None:
        imgRGB = cv2.cvtColor(fallback_frame, cv2.COLOR_BGR2RGB)
        results = hands.process(imgRGB)
        if results.multi_hand_landmarks:
            handLandmarks = results.multi_hand_landmarks[0]
            xList, yList = [], []
            dataAux = []

            for lm in handLandmarks.landmark:
                xList.append(lm.x)
                yList.append(lm.y)

            for lm in handLandmarks.landmark:
                dataAux.append(lm.x - min(xList))
                dataAux.append(lm.y - min(yList))

            inputData1 = np.array(dataAux, dtype=np.float32).reshape(1, 42, 1)
            prediction1 = model.predict(inputData1, verbose=0)
            index1 = np.argmax(prediction1, axis=1)[0]
            confidence1 = float(np.max(prediction1))
            label1 = labelEncoder.inverse_transform([index1])[0]

            print(confidence2)

            if confidence2 >= 0.5:
                return {'letter': label2, 'confidence': confidence2}
            else:
                return {'letter': label1, 'confidence': confidence1}

    return {'letter': label2 if confidence2 >= 0.7 else '', 'confidence': confidence2 if confidence2 >= 0.7 else 0.0}
