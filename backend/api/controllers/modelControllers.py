import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import pickle

model = tf.keras.models.load_model('../../ai_model/models/detectLettersModel.keras')
with open('../../ai_model/models/labelEncoder.pickle', 'rb') as f:
    labelEncoder = pickle.load(f)

mpHands = mp.solutions.hands
hands = mpHands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.3)

def detect_from_video(video_path):
    cap = cv2.VideoCapture(video_path)
    predictions = []

    while cap.isOpened():
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
                prediction = model.predict(input_data)
                predictedIndex = np.argmax(prediction, axis=1)[0]
                predictedLabel = labelEncoder.inverse_transform([predictedIndex])[0]
                predictions.append(predictedLabel)
                confidence = float(np.max(prediction))

    cap.release()
    if predictions:
      phrase = max(set(predictions), key=predictions.count)
      return {'phrase': phrase, 'confidence': confidence}
    else:
        return {'phrase': 'Nothing detected', 'confidence': 0.0}
