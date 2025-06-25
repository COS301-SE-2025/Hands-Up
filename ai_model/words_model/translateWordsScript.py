import sys
import struct
import cv2
import numpy as np
import pickle
import tensorflow as tf
import mediapipe as mp
from collections import deque
import os
import json # Import the json module

model_path = os.path.join(os.path.dirname(__file__), 'wordsModel.keras')
labelEncodePath = os.path.join(os.path.dirname(__file__), 'labelEncoder.pickle')

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
holistic = mpHolistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

sequence = deque(maxlen=30)

def process_frames(frames):
    global sequence
    prediction = ""

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
        pose = padLandmarks(
            [coord for lm in results.pose_landmarks.landmark for coord in (lm.x, lm.y, lm.z, lm.visibility)]
            if results.pose_landmarks else None, 132
        )
        face = padLandmarks(
            [coord for lm in results.face_landmarks.landmark for coord in (lm.x, lm.y, lm.z)]
            if results.face_landmarks else None, 1404
        )

        frameFeatures = np.concatenate([pose, face, left, right])
        sequence.append(frameFeatures)
    
    message = {}

    if len(sequence) == 30:
        inputData = np.expand_dims(sequence, axis=0)
        yPred = model.predict(inputData, verbose=0)
        classIndex = np.argmax(yPred)
        confidence = float(np.max(yPred))  # convert numpy float to native float
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

def read_frames_from_stdin():
    # Read number of frames
    frame_count_bytes = sys.stdin.buffer.read(4)
    frame_count = struct.unpack('<I', frame_count_bytes)[0]

    frames = []
    for _ in range(frame_count):
        # Read length
        length_bytes = sys.stdin.buffer.read(4)
        length = struct.unpack('<I', length_bytes)[0]
        # Read frame data
        frame = sys.stdin.buffer.read(length)
        frames.append(frame)

    return frames

if __name__ == "__main__":
    frames = read_frames_from_stdin()
    result = process_frames(frames)
    # Print the result as a JSON string
    print(json.dumps(result), flush=True)