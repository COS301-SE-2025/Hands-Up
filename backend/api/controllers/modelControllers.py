import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import pickle
import collections
import time

model = tf.keras.models.load_model('../../../ai_model/models/detectLettersModel.keras')
with open('../../../ai_model/models/labelEncoder.pickle', 'rb') as f:
    labelEncoder = pickle.load(f)

class ZGestureStateMachine:
    def __init__(self):
        self.state = 0
        self.resetTimer()

    def resetTimer(self):
        self.timeInState = 0
        self.maxTimePerState = 10

    def update(self, landmarks):
        self.timeInState += 1
        if self.timeInState > self.maxTimePerState:
            self.state = 0
            self.resetTimer()
            return False

        indexTip = landmarks[8]
        wrist = landmarks[0]
        dx = indexTip.x - wrist.x
        dy = indexTip.y - wrist.y

        direction = self.getDirection(dx, dy)

        if self.state == 0 and direction == "right":
            self.state = 1
            self.resetTimer()
        elif self.state == 1 and direction == "down_right":
            self.state = 2
            self.resetTimer()
        elif self.state == 2 and direction == "right":
            self.state = 3
            self.resetTimer()
            return True

        return False

    def getDirection(self, dx, dy):
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
        self.timeInState = 0
        self.maxTimePerState = 10

    def update(self, landmarks):
        self.timeInState += 1
        if self.timeInState > self.maxTimePerState:
            self.state = 0
            self.timeInState = 0
            return False

        pinkyTip = landmarks[20]
        wrist = landmarks[0]

        dx = pinkyTip.x - wrist.x
        dy = pinkyTip.y - wrist.y

        direction = self.getDirection(dx, dy)

        if self.state == 0 and direction == "down":
            self.state = 1
            self.timeInState = 0
        elif self.state == 1 and direction == "left":
            self.state = 2
            self.timeInState = 0
            return True

        return False

    def getDirection(self, dx, dy, threshold=0.02):
        if abs(dy) > abs(dx):
            return "down"
        elif abs(dx) > abs(dy):
            return "left"
        return "unknown"


def detectFromImage(imageIn):
    predictions = collections.deque(maxlen=15)
    landmarkBuffer = collections.deque(maxlen=30)
    zStateMachine = ZGestureStateMachine()
    jStateMachine = JGestureStateMachine()
    phrase = ""
    lastPredictionTime = 0
    cooldownDuration = 6

    image = cv2.imread(imageIn)
    imgRGB = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    with mp.solutions.hands.Hands(static_image_mode=True) as hands:
        results = hands.process(imgRGB)

        currentTime = time.time()

        if results.multi_hand_landmarks:
            for handLandmarks in results.multi_hand_landmarks:
                landmarkBuffer.append(handLandmarks.landmark)

                if zStateMachine.update(handLandmarks.landmark):
                    phrase = "Z"
                    predictions.clear()
                    lastPredictionTime = currentTime
                    continue

                if jStateMachine.update(handLandmarks.landmark):
                    phrase = "J"
                    predictions.clear()
                    lastPredictionTime = currentTime
                    continue

                if currentTime - lastPredictionTime > cooldownDuration:
                    x_ = [lm.x for lm in handLandmarks.landmark]
                    y_ = [lm.y for lm in handLandmarks.landmark]
                    xMin, yMin = min(x_), min(y_)

                    dataAux = []
                    for lm in handLandmarks.landmark:
                        dataAux.append(lm.x - xMin)
                        dataAux.append(lm.y - yMin)

                    inputData = np.array(dataAux, dtype=np.float32).reshape(1, 42, 1)
                    prediction = model.predict(inputData, verbose=0)
                    predictedIndex = np.argmax(prediction, axis=1)[0]
                    predictedLabel = labelEncoder.inverse_transform([predictedIndex])[0]
                    confidence = float(np.max(prediction))

                    if confidence > 0.8:
                        predictions.append(predictedLabel)

                        if len(predictions) == predictions.maxlen:
                            phrase = max(set(predictions), key=predictions.count)
                            lastPredictionTime = currentTime
                            predictions.clear()
    if predictions:
        phrase = max(set(predictions), key=predictions.count)
        if confidence > 0.8:
            return {'phrase': phrase, 'confidence': confidence}
        else:
            return {'phrase': 'Nothing detected', 'confidence': 0.0}
    else:
        return {'phrase': 'Nothing detected', 'confidence': 0.0}