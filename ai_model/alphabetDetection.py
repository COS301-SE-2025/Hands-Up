import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import pickle
import time
from collections import Counter

# Load model and label encoder
model = tf.keras.models.load_model('models/detectLettersModel.keras') 
with open('models/labelEncoder.pickle', 'rb') as f:
    labelEncoder = pickle.load(f)

mpHands = mp.solutions.hands
hands = mpHands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.3)

cap = cv2.VideoCapture(0)

PREDICTION_WINDOW = 5  
CONFIDENCE_THRESHOLD = 0.8

start_time = None
predictions = []

while True:
    ret, frame = cap.read()
    if not ret:
        break

    imgRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(imgRGB)

    if results.multi_hand_landmarks:
        for handLandmarks in results.multi_hand_landmarks:
            x_ = [lm.x for lm in handLandmarks.landmark]
            y_ = [lm.y for lm in handLandmarks.landmark]

            xMin, yMin = min(x_), min(y_)
            dataAux = []
            for lm in handLandmarks.landmark:
                dataAux.append(lm.x - xMin)
                dataAux.append(lm.y - yMin)

            input_data = np.array(dataAux, dtype=np.float32).reshape(1, 42, 1)
            prediction = model.predict(input_data, verbose=0)[0]
            confidence = np.max(prediction)
            predictedIndex = np.argmax(prediction)
            predictedLabel = labelEncoder.inverse_transform([predictedIndex])[0]

            
            if start_time is None:
                start_time = time.time()
                predictions = []

            predictions.append((predictedLabel, confidence))

            mp.solutions.drawing_utils.draw_landmarks(frame, handLandmarks, mpHands.HAND_CONNECTIONS)
            
            labels = [label for label, conf in predictions if conf >= CONFIDENCE_THRESHOLD]
            if labels:
                final_prediction = Counter(labels).most_common(1)[0][0]
                message = f'Prediction: {final_prediction}'
            elif confidence < CONFIDENCE_THRESHOLD and confidence > 0.5:
                message = f'Maybe {predictedLabel}, reposition hand and try again'
            else:
                message = f'Invalid sign, try again'

            start_time = None
            predictions = []

            cv2.putText(frame, message, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)

    cv2.imshow("ASL Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
