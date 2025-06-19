import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import pickle
import collections
import time

# Load model and label encoder
model = tf.keras.models.load_model('models/detectLettersModel.keras')
with open('models/labelEncoder.pickle', 'rb') as f:
    labelEncoder = pickle.load(f)

mpHands = mp.solutions.hands
hands = mpHands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.3)

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

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Cannot open camera")
    exit()

predictions = collections.deque(maxlen=15)
landmarkBuffer = collections.deque(maxlen=30)
zStateMachine = ZGestureStateMachine()
phrase = ""
lastPredictionTime = 0
cooldownDuration = 2

while True:
    ret, frame = cap.read()
    if not ret:
        break

    imgRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(imgRGB)

    currentTime = time.time()

    if results.multi_hand_landmarks:
        for handLandmarks in results.multi_hand_landmarks:
            landmarkBuffer.append(handLandmarks.landmark)

            # Detect Z Gesture first
            if zStateMachine.update(handLandmarks.landmark):
                phrase = "Z"
                predictions.clear()
                lastPredictionTime = currentTime
                continue

            # If not in cooldown, make a static prediction
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
                    # Only update the phrase if we have a consensus
                    if len(predictions) == predictions.maxlen:
                        phrase = max(set(predictions), key=predictions.count)
                        lastPredictionTime = currentTime
                        predictions.clear()

    cv2.putText(frame, phrase, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
    cv2.imshow("ASL Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()