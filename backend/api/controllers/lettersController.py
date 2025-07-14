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

lettersModel = tf.keras.models.load_model('../../ai_model/models/detectLettersModel.keras')
with open('../../ai_model/models/labelEncoder.pickle', 'rb') as f:
    labelEncoder = pickle.load(f)

lettersModel2 = tf.keras.models.load_model('../../ai_model/jz_model/JZModel.keras')
with open('../../ai_model/jz_model/labelEncoder.pickle', 'rb') as f:
    labelEncoder2 = pickle.load(f)

numbersModel = tf.keras.models.load_model('../../ai_model/models/detectNumbersModel.keras')
with open('../../ai_model/models/numLabelEncoder.pickle', 'rb') as f:
    numLabelEncoder = pickle.load(f)

sequenceNum = 20
hands = mp.solutions.hands.Hands(static_image_mode=True)

def detectFromImage(sequenceList):

    if len(sequenceList) != sequenceNum:
        return {'letter': '', 'confidence': 0.0}

    processed_sequence = []

    for imagePath in sequenceList:
        image = cv2.imread(imagePath)
        if image is None:
            continue 

        imgRGB = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(imgRGB)

        if not results.multi_hand_landmarks:
            continue  

        handLandmarks = results.multi_hand_landmarks[0]  

        xList, yList = [], []
        dataAux2 = []

        for lm in handLandmarks.landmark:
            xList.append(lm.x)
            yList.append(lm.y)

        for lm in handLandmarks.landmark:
            dataAux2.append(lm.x - min(xList))
            dataAux2.append(lm.y - min(yList))
            dataAux2.append(0) 

        processed_sequence.append(dataAux2)

    confidence2 = 0.0
    label2 = ""
    fallback_frame = cv2.imread(sequenceList[-1])  

    if len(processed_sequence) != sequenceNum:
        return {'letter': '', 'confidence': 0.0}
       
    inputData2 = np.array(processed_sequence, dtype=np.float32).reshape(1, sequenceNum, 63)
    prediction2 = lettersModel2.predict(inputData2, verbose=0)
    index2 = np.argmax(prediction2, axis=1)[0]
    confidence2 = float(np.max(prediction2))
    label2 = labelEncoder2.inverse_transform([index2])[0]
    print(f'Letters Model 2:{label2} at {confidence2}')

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

            #check in letters model1
            inputData1 = np.array(dataAux, dtype=np.float32).reshape(1, 42, 1)
            prediction1 = lettersModel.predict(inputData1, verbose=0)
            index1 = np.argmax(prediction1, axis=1)[0]
            confidence1 = float(np.max(prediction1))
            label1 = labelEncoder.inverse_transform([index1])[0]

            print(f'Letters Model 2: {label1} at {confidence1}')

            prediction3 = numbersModel.predict(inputData1, verbose=0)
            index3 = np.argmax(prediction3, axis=1)[0]
            confidence3 = float(np.max(prediction3))
            label3 = numLabelEncoder.inverse_transform([index3])[0]

            print(f'Numbers Model: {label3} at {confidence3}')

            if label1==label2:
                return {'letter': label2, 'confidence': confidence2}
            # elif label2=="Z" and label1=="L":
            #     return {'letter': label2, 'confidence': confidence2}
            # elif label2=="J" and label1=="I":
            #     return {'letter': label2, 'confidence': confidence2}
            else:
                return {'letter': label1, 'confidence': confidence1}        
    else:   
        return {'letter': label2, 'confidence': confidence2}