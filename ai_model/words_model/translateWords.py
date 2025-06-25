import cv2
import numpy as np
import pickle
import tensorflow as tf
import mediapipe as mp
from collections import deque
import time

model = tf.keras.models.load_model('gesture_lstm_model.keras')
with open('label_encoder.pkl', 'rb') as f:
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

cap = cv2.VideoCapture(0)
sequence = deque(maxlen=50)
prediction = ""

print("Press 's' to start signing, or 'q' to quit.")

collecting = False
frameCounter = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    img = cv2.flip(frame, 1)
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = holistic.process(imgRGB)

    if not collecting:
        cv2.putText(img, "Press 's' to sign", (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    else:
        cv2.putText(img, f"Collecting frames... {frameCounter}/30", (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('s') and not collecting:
        sequence.clear()
        frameCounter = 0
        collecting = True
        prediction = ""
    elif key == ord('q'):
        break

    if collecting:
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
        frameCounter += 1

        if len(sequence) == 50:
            inputData = np.expand_dims(sequence, axis=0)
            yPred = model.predict(inputData, verbose=0)
            classIndex = np.argmax(yPred)
            confidence = np.max(yPred)
            if confidence >= 0.8:
                prediction = labels[classIndex]
            else:
                prediction = "Uncertain"

            collecting = False

    if prediction and not collecting:
        cv2.putText(img, f'Prediction: {prediction}', (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)

    cv2.imshow("Sign Language Interpreter", img)

cap.release()
cv2.destroyAllWindows()
holistic.close()
