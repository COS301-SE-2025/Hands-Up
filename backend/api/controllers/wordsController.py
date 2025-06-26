import sys
import struct
import cv2
import numpy as np
import pickle
import tensorflow as tf
import mediapipe as mp
import collections
from collections import deque
import time
import os

model_path = os.path.join('../../ai_model/words_model/wordsModel.keras')
labelEncodePath = os.path.join('../../ai_model/words_model/labelEncoder.pickle')

model = tf.keras.models.load_model(model_path)
with open(labelEncodePath, 'rb') as f:
    labelEncoder = pickle.load(f)
labels = labelEncoder.classes_

def padLandmarks(landmarks, expectedLen):
    if landmarks is None:
        return [0.0] * expectedLen
    elif len(landmarks) < expectedLen:
        return landmarks + [0.0] * (expectedLen - len(landmarks))
    return landmarks[:expectedLen]

mpHolistic = mp.solutions.holistic

sequence = deque(maxlen=30)

def detectFromFrames(frames):
    global sequence
    prediction = ""

    with mp.solutions.holistic.Holistic(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as holistic:
        for frame_bytes in frames:
            np_arr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame is None:
                continue

            imgRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = holistic.process(imgRGB)

            left = padLandmarks(
                [coord for lm in results.left_hand_landmarks.landmark for coord in (lm.x, lm.y, lm.z)]
                if results.left_hand_landmarks else None, 63
            )
            right = padLandmarks(
                [coord for lm in results.right_hand_landmarks.landmark for coord in (lm.x, lm.y, lm.z)]
                if results.right_hand_landmarks else None, 63
            )

            frameFeatures = np.concatenate([left, right])
            sequence.append(frameFeatures)
        
        message = {}

        if len(sequence) == 30:
            inputData = np.expand_dims(sequence, axis=0)
            yPred = model.predict(inputData, verbose=0)
            classIndex = np.argmax(yPred)
            confidence = float(np.max(yPred))  
            if confidence >= 0.8:
                prediction = labels[classIndex]
            else:
                prediction = "uncertain"
            sequence.clear()

            message = {
                "prediction": prediction,
                "confidence": confidence
            }
        else:
            message = {
                "prediction": "unknown sign",
                "confidence": 0.0
            }

        return message

def readFramesFromStdin():
    frame_count_bytes = sys.stdin.buffer.read(4)
    frame_count = struct.unpack('<I', frame_count_bytes)[0]

    frames = []
    for _ in range(frame_count):
        length_bytes = sys.stdin.buffer.read(4)
        length = struct.unpack('<I', length_bytes)[0]
        frame = sys.stdin.buffer.read(length)
        frames.append(frame)

    return frames
