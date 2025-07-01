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

model2 = hub.load("https://www.kaggle.com/models/sayannath235/american-sign-language/TensorFlow2/american-sign-language/1")
labels = [chr(i) for i in range(ord('A'), ord('Z') + 1)] + ['del', 'nothing', 'space']

def detectFromImage(imageIn):
    phrase = ""
    predictions = deque(maxlen=10)

    image = cv2.imread(imageIn)
    imgRGB = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    with mp.solutions.hands.Hands(static_image_mode=True) as hands:
        results = hands.process(imgRGB)
        currentTime = time.time()

        if results.multi_hand_landmarks:
            for handLandmarks in results.multi_hand_landmarks:
                dataAux = []
                xList = []
                yList = []

                for lm in handLandmarks.landmark:
                    xList.append(lm.x)
                    yList.append(lm.y)

                for lm in handLandmarks.landmark:
                    dataAux.append(lm.x - min(xList))
                    dataAux.append(lm.y - min(yList))

                inputData1 = np.array(dataAux, dtype=np.float32).reshape(1, 42, 1)
                resized_img = cv2.resize(imgRGB, (224, 224))  
                normalized_img = resized_img.astype(np.float32) / 255.0
                inputData2 = np.expand_dims(normalized_img, axis=0)  

                # Model 1
                prediction1 = model.predict(inputData1, verbose=0)
                index1 = np.argmax(prediction1, axis=1)[0]
                label1 = labelEncoder.inverse_transform([index1])[0]
                confidence1 = float(np.max(prediction1))

                # Model 2
                prediction2 = model2(inputData2).numpy()
                index2 = np.argmax(prediction2, axis=1)[0]
                label2 = labels[index2]

                print(label1," and ", label2)
                confidence2 = float(np.max(prediction2))

                # If both models agree and both are confident
                if label1 == label2:
                    predictions.append(label1)

                    if len(predictions) == predictions.maxlen:
                        phrase = max(set(predictions), key=predictions.count)
                        predictions.clear()
                        return {'phrase': phrase, 'confidence': min(confidence1, confidence2)}
        
    return {'phrase': 'Uncertain', 'confidence': 0.0}
