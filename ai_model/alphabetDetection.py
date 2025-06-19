import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp
import pickle

model = tf.keras.models.load_model('models/detectLettersModel.keras') 
with open('models/labelEncoder.pickle', 'rb') as f:
    labelEncoder = pickle.load(f)

mpHands = mp.solutions.hands
hands = mpHands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.3)

cap = cv2.VideoCapture(0)

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

            prediction = model.predict(input_data)
            predictedIndex = np.argmax(prediction, axis=1)[0]
            predictedLabel = labelEncoder.inverse_transform([predictedIndex])[0]

            mp.solutions.drawing_utils.draw_landmarks(frame, handLandmarks, mpHands.HAND_CONNECTIONS)

            cv2.putText(frame, f'Prediction: {predictedLabel}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)

    cv2.imshow("ASL Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
