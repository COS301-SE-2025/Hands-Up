import numpy as np
import pandas as pd
import os
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

    processedSequence = []

    for imagePath in sequenceList:
        image = cv2.imread(imagePath)
        if image is None:
            continue 

            lms_array = flat_lms.reshape(-1, coords_per_lm)
            coords_for_mean = lms_array[:, :3] if coords_per_lm == 4 else lms_array

            if np.all(coords_for_mean == 0):
                normalized_frame_parts.append(np.array(template, dtype=np.float32))
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

        processedSequence.append(dataAux2)

    confidence2 = 0.0
    label2 = ""
    fallback_frame = cv2.imread(sequenceList[-1])  

    # for i in range(len(processedSequence)):
    #     if processedSequence[i] is None:
    #         prevIdx, nextIdx = -1, -1
            
    #         for j in range(i - 1, -1, -1):
    #             if processedSequence[j] is not None:
    #                 prevIdx = j
    #                 break
            
    #         for j in range(i + 1, len(processedSequence)):
    #             if processedSequence[j] is not None:
    #                 nextIdx = j
    #                 break

    #         if prevIdx != -1 and nextIdx != -1:
    #             prevData = np.array(processedSequence[prevIdx])
    #             nextData = np.array(processedSequence[nextIdx])
    #             t = (i - prevIdx) / (nextIdx - prevIdx)
    #             interpolatedData = prevData + (nextData - prevData) * t
    #             processedSequence[i] = interpolatedData.tolist()
    #         elif prevIdx != -1:
    #             processedSequence[i] = processedSequence[prevIdx]
    #         elif nextIdx != -1:
    #             processedSequence[i] = processedSequence[nextIdx]

    if len(processedSequence) != sequenceNum:
        print("incomplete sequence: ", len(processedSequence))
        return {'letter': '', 'confidence': 0.0}
       
    inputData2 = np.array(processedSequence, dtype=np.float32).reshape(1, sequenceNum, 63)
    prediction2 = model2.predict(inputData2, verbose=0)

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

            print(f'Letters Model 1: {label1} at {confidence1}')

            prediction3 = numbersModel.predict(inputData1, verbose=0)
            index3 = np.argmax(prediction3, axis=1)[0]
            confidence3 = float(np.max(prediction3))
            label3 = numLabelEncoder.inverse_transform([index3])[0]

            print(f'Numbers Model: {label3} at {confidence3}')

            if label1==label2:
                return {'letter': label2, 'confidenceLetter': confidence2,
                        'number': label3, 'confidenceNumber': confidence3}
            # elif label2=="Z" and label1=="L":
            #     return {'letter': label2, 'confidence': confidence2}
            # elif label2=="J" and label1=="I":
            #     return {'letter': label2, 'confidence': confidence2}
            else:
                return {'letter': label1, 'confidenceLetter': confidence1
                        , 'number': label3, 'confidenceNumber': confidence3}        
    else:   
        return {'letter': label2, 'confidenceLetter': confidence2
                , 'number': '', 'confidenceNumber': 0.0}