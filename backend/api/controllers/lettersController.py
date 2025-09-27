import cv2
import numpy as np
import pickle
import tensorflow as tf
import mediapipe as mp
from fastapi import WebSocket

lettersModel = tf.keras.models.load_model('../../ai_model/models/detectLettersModel.keras')
with open('../../ai_model/models/labelEncoder.pickle', 'rb') as f:
    labelEncoder = pickle.load(f)

lettersModel2 = tf.keras.models.load_model('../../ai_model/jz_model/JZModel.keras')
with open('../../ai_model/jz_model/labelEncoder.pickle', 'rb') as f:
    labelEncoder2 = pickle.load(f)

numbersModel = tf.keras.models.load_model('../../ai_model/models/detectNumbersModel.keras')
with open('../../ai_model/models/numLabelEncoder.pickle', 'rb') as f:
    numLabelEncoder = pickle.load(f)

hands = mp.solutions.hands.Hands(static_image_mode=True)

async def detect_from_image_bytes(sequence_bytes_list, dexterity='right', websocket: WebSocket = None, is_dynamic=False):
    num_frames = len(sequence_bytes_list)
    if num_frames == 0:
        return {'letter': '', 'confidenceLetter': 0.0, 'number': '', 'confidenceNumber': 0.0}

    def process_single_frame(image_bytes):
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            return None, None, None, None

        imgRGB = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(imgRGB)
        if not results.multi_hand_landmarks:
            return None, None, None, None

        handLandmarks = results.multi_hand_landmarks[0]
        xList, yList = [], []
        dataAux = []

        for lm in handLandmarks.landmark:
            xList.append(lm.x)
            yList.append(lm.y)

        for lm in handLandmarks.landmark:
            dataAux.append(lm.x - min(xList))
            dataAux.append(lm.y - min(yList))

        inputData = np.array(dataAux, dtype=np.float32).reshape(1, 42, 1)

        prediction1 = lettersModel.predict(inputData, verbose=0)
        index1 = np.argmax(prediction1, axis=1)[0]
        confidence1 = float(np.max(prediction1))
        label1 = labelEncoder.inverse_transform([index1])[0]

        prediction3 = numbersModel.predict(inputData, verbose=0)
        index3 = np.argmax(prediction3, axis=1)[0]
        confidence3 = float(np.max(prediction3))
        label3 = numLabelEncoder.inverse_transform([index3])[0]

        print(f'Letters Model 1: {label1} at {confidence1}')
        print(f'Numbers Model: {label3} at {confidence3}')

        return label1, confidence1, label3, confidence3

    def process_sequence(frames):
        processedSequence = []
        for image_bytes in frames:
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if image is None:
                processedSequence.append(None)
                continue

            imgRGB = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = hands.process(imgRGB)
            if not results.multi_hand_landmarks:
                processedSequence.append(None)
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

        for i in range(len(processedSequence)):
            if processedSequence[i] is None:
                prevIdx, nextIdx = -1, -1
                for j in range(i - 1, -1, -1):
                    if processedSequence[j] is not None:
                        prevIdx = j
                        break
                for j in range(i + 1, len(processedSequence)):
                    if processedSequence[j] is not None:
                        nextIdx = j
                        break
                if prevIdx != -1 and nextIdx != -1:
                    prevData = np.array(processedSequence[prevIdx])
                    nextData = np.array(processedSequence[nextIdx])
                    t = (i - prevIdx) / (nextIdx - prevIdx)
                    interpolatedData = prevData + (nextData - prevData) * t
                    processedSequence[i] = interpolatedData.tolist()
                elif prevIdx != -1:
                    processedSequence[i] = processedSequence[prevIdx]
                elif nextIdx != -1:
                    processedSequence[i] = processedSequence[nextIdx]

        if None in processedSequence:
            print("Incomplete sequence after interpolation")
            return None, None

        inputData2 = np.array(processedSequence, dtype=np.float32).reshape(1, len(frames), 63)
        prediction2 = lettersModel2.predict(inputData2, verbose=0)
        index2 = np.argmax(prediction2, axis=1)[0]
        confidence2 = float(np.max(prediction2))
        label2 = labelEncoder2.inverse_transform([index2])[0]
        print(f'Letters Model 2: {label2} at {confidence2}')

        return label2, confidence2

    if num_frames == 1:
        label1, confidence1, label3, confidence3 = process_single_frame(sequence_bytes_list[0])
        if label1 is None:
            return {'letter': '', 'confidenceLetter': 0.0, 'number': '', 'confidenceNumber': 0.0}
        if label1 in ['J', 'Z']:
            return {'status': 'wait_more_dynamic'}
        return {'status': 'wait_more'}

    elif num_frames == 2:
        label1_first, _, _, _ = process_single_frame(sequence_bytes_list[0])
        label1_second, confidence1, label3, confidence3 = process_single_frame(sequence_bytes_list[1])
        if label1_first is None or label1_second is None:
            return {'letter': '', 'confidenceLetter': 0.0, 'number': '', 'confidenceNumber': 0.0}
        if label1_first == label1_second and label1_first not in ['J', 'Z']:
            return {'letter': label1_second, 'confidenceLetter': confidence1,
                    'number': label3, 'confidenceNumber': confidence3}
        elif label1_first in ['J', 'Z'] or label1_second in ['J', 'Z']:
            return {'status': 'wait_more_dynamic'}
        else:
            return {'letter': '', 'confidenceLetter': 0.0, 'number': '', 'confidenceNumber': 0.0}

    elif num_frames >= 10 and is_dynamic:
        label2, confidence2 = process_sequence(sequence_bytes_list[:10])
        if label2 is None:
            return {'letter': '', 'confidenceLetter': 0.0, 'number': '', 'confidenceNumber': 0.0}
        _, _, label3, confidence3 = process_single_frame(sequence_bytes_list[-1])
        return {'letter': label2, 'confidenceLetter': confidence2,
                'number': label3, 'confidenceNumber': confidence3}

    else:
        return {'letter': '', 'confidenceLetter': 0.0, 'number': '', 'confidenceNumber': 0.0}