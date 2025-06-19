import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import pickle
import collections
import time

model = tf.keras.models.load_model('../../ai_model/models/detectLettersModel.keras')
with open('../../ai_model/models/labelEncoder.pickle', 'rb') as f:
    labelEncoder = pickle.load(f)

mpHands = mp.solutions.hands
hands = mpHands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.3)

class ZGestureStateMachine:
    def __init__(self):
        self.state = 0
        self.reset_timer()

    def reset_timer(self):
        self.time_in_state = 0
        self.max_time_per_state = 10  

    def update(self, landmarks):
        self.time_in_state += 1
        if self.time_in_state > self.max_time_per_state:
            self.state = 0
            self.reset_timer()
            return False

        index_tip = landmarks[8]
        wrist = landmarks[0]
        dx = index_tip.x - wrist.x
        dy = index_tip.y - wrist.y

        direction = self.get_direction(dx, dy)

        if self.state == 0 and direction == "right":
            self.state = 1
            self.reset_timer()
        elif self.state == 1 and direction == "down_right":
            self.state = 2
            self.reset_timer()
        elif self.state == 2 and direction == "right":
            self.state = 3
            self.reset_timer()
            return True  

        return False

    def get_direction(self, dx, dy):
        if abs(dx) > abs(dy):
            return "right" if dx > 0 else "left"
        elif abs(dy) > abs(dx):
            return "down" if dy > 0 else "up"
        elif dx > 0 and dy > 0:
            return "down_right"
        return "unknown"

class JGestureStateMachine:
    def __init__(self):
        self.state = 0
        self.time_in_state = 0
        self.max_time_per_state = 10

    def update(self, landmarks):
        self.time_in_state += 1
        if self.time_in_state > self.max_time_per_state:
            self.state = 0
            self.time_in_state = 0
            return False

        pinky_tip = landmarks[20]
        wrist = landmarks[0]

        dx = pinky_tip.x - wrist.x
        dy = pinky_tip.y - wrist.y

        direction = self.get_direction(dx, dy)

        if self.state == 0 and direction == "down":
            self.state = 1
            self.time_in_state = 0
        elif self.state == 1 and direction == "left":
            self.state = 2
            self.time_in_state = 0
            return True  

        return False

    def get_direction(self, dx, dy, threshold=0.02):
        if abs(dy) > abs(dx):
            return "down"
        elif abs(dx) > abs(dy):
            return "left"
        return "unknown"


def detect_from_image(imagine):
    cap = cv2.VideoCapture(imagine)
    predictions = collections.deque(maxlen=15)
    landmark_buffer = collections.deque(maxlen=30)
    z_state_machine = ZGestureStateMachine()
    j_state_machine = JGestureStateMachine()
    phrase = ""
    last_prediction_time = 0
    cooldown_duration = 6

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        imgRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(imgRGB)

        current_time = time.time()

        if results.multi_hand_landmarks:
            for handLandmarks in results.multi_hand_landmarks:
                landmark_buffer.append(handLandmarks.landmark)

                if z_state_machine.update(handLandmarks.landmark):
                    phrase = "Z"
                    predictions.clear()
                    last_prediction_time = current_time
                    continue

                if j_state_machine.update(handLandmarks.landmark):
                    phrase = "J"
                    predictions.clear()
                    last_prediction_time = current_time
                    continue

                if current_time - last_prediction_time > cooldown_duration:
                    x_ = [lm.x for lm in handLandmarks.landmark]
                    y_ = [lm.y for lm in handLandmarks.landmark]
                    xMin, yMin = min(x_), min(y_)

                    dataAux = []
                    for lm in handLandmarks.landmark:
                        dataAux.append(lm.x - xMin)
                        dataAux.append(lm.y - yMin)

                    input_data = np.array(dataAux, dtype=np.float32).reshape(1, 42, 1)
                    prediction = model.predict(input_data, verbose=0)
                    predictedIndex = np.argmax(prediction, axis=1)[0]
                    predictedLabel = labelEncoder.inverse_transform([predictedIndex])[0]
                    confidence = float(np.max(prediction))

                    if confidence > 0.8:
                        predictions.append(predictedLabel)
                       
                        if len(predictions) == predictions.maxlen:
                            phrase = max(set(predictions), key=predictions.count)
                            last_prediction_time = current_time
                            predictions.clear()

    cap.release()
    if predictions:
      phrase = max(set(predictions), key=predictions.count)
      if confidence > 0.8:
        return {'phrase': phrase, 'confidence': confidence}
      else:
        return {'phrase': 'Nothing detected', 'confidence': 0.0}
    else:
        return {'phrase': 'Nothing detected', 'confidence': 0.0}

import time

def detect_from_video(video_path):
    cap = cv2.VideoCapture(video_path)

    predictions = []
    filtered_phrase = []
    previous_label = None
    frames_without_hand = 0
    HAND_LOST_THRESHOLD = 8  
    SIGN_INTERVAL = 2.0  

    last_sign_time = time.time() - SIGN_INTERVAL  

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        imgRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(imgRGB)

        if results.multi_hand_landmarks:
            frames_without_hand = 0

            current_time = time.time()
            if current_time - last_sign_time >= SIGN_INTERVAL:
                for handLandmarks in results.multi_hand_landmarks:
                    x_ = [lm.x for lm in handLandmarks.landmark]
                    y_ = [lm.y for lm in handLandmarks.landmark]

                    xMin, yMin = min(x_), min(y_)
                    dataAux = []

                    for lm in handLandmarks.landmark:
                        dataAux.append(lm.x - xMin)
                        dataAux.append(lm.y - yMin)

                    input_data = np.array(dataAux, dtype=np.float32).reshape(1, 42, 1)
                    prediction = model.predict(input_data, verbose=0)
                    predictedIndex = np.argmax(prediction, axis=1)[0]
                    predictedLabel = labelEncoder.inverse_transform([predictedIndex])[0]
                    confidence = float(np.max(prediction))

                    if confidence < 0.8:
                        return {
                            'phrase': 'Nothing detected'
                        }

                    predictions.append({'label': predictedLabel, 'confidence': round(confidence, 4)})

                    if predictedLabel != previous_label:
                        filtered_phrase.append(predictedLabel)
                        previous_label = predictedLabel
                        last_sign_time = current_time  

        else:
            frames_without_hand += 1
            if frames_without_hand > HAND_LOST_THRESHOLD:
                previous_label = None  

    cap.release()

    return {
        'phrase': ''.join(filtered_phrase),
        'frames': predictions
    } if predictions else {'phrase': 'Nothing detected', 'frames': []}