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

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Cannot open camera")
    exit()

predictions = collections.deque(maxlen=15)
landmark_buffer = collections.deque(maxlen=30)
z_state_machine = ZGestureStateMachine()
phrase = ""
last_prediction_time = 0
cooldown_duration = 2 

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

            # Detect Z Gesture first
            if z_state_machine.update(handLandmarks.landmark):
                phrase = "Z"
                predictions.clear()
                last_prediction_time = current_time
                continue

            # If not in cooldown, make a static prediction
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
                    # Only update the phrase if we have a consensus
                    if len(predictions) == predictions.maxlen:
                        phrase = max(set(predictions), key=predictions.count)
                        last_prediction_time = current_time
                        predictions.clear()

    cv2.putText(frame, phrase, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
    cv2.imshow("ASL Detection", frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
