import os
import numpy as np
import cv2
import mediapipe as mp

actions = ['none']
noSequences = 30
sequenceLength = 30
startFolder = 0

DATADIR = os.path.join('tmkdt_words')  

for action in actions:
    for sequence in range(startFolder, startFolder + noSequences):
        os.makedirs(os.path.join(DATADIR, action, str(sequence)), exist_ok=True)

def mediapipeDetection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = model.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    return image, results

def drawStyledLandmarks(image, results):
    mpDrawing = mp.solutions.drawing_utils
    mpDrawingStyles = mp.solutions.drawing_styles

    if results.pose_landmarks:
        mpDrawing.draw_landmarks(image, results.pose_landmarks, mp.solutions.holistic.POSE_CONNECTIONS)
    if results.left_hand_landmarks:
        mpDrawing.draw_landmarks(image, results.left_hand_landmarks, mp.solutions.holistic.HAND_CONNECTIONS)
    if results.right_hand_landmarks:
        mpDrawing.draw_landmarks(image, results.right_hand_landmarks, mp.solutions.holistic.HAND_CONNECTIONS)

def extractKeypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, lh, rh])


cap = cv2.VideoCapture(0)
with mp.solutions.holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:

    for action in actions:
        for sequence in range(startFolder, startFolder + noSequences):
            print(f"Collecting for {action}, sequence {sequence}")
            for frameNum in range(sequenceLength):

                ret, frame = cap.read()
                image, results = mediapipeDetection(frame, holistic)
                drawStyledLandmarks(image, results)

                if frameNum == 0:
                    cv2.putText(image, 'STARTING COLLECTION', (120,200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 4, cv2.LINE_AA)
                    cv2.imshow('OpenCV Feed', image)
                    cv2.waitKey(1000)  
                else:
                    cv2.putText(image, f'Collecting {action}, Video #{sequence}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,255), 2, cv2.LINE_AA)
                    cv2.imshow('OpenCV Feed', image)

                keypoints = extractKeypoints(results)
                np.save(os.path.join(DATADIR, action, str(sequence), str(frameNum)), keypoints)

                if cv2.waitKey(10) & 0xFF == ord('q'):
                    break

cap.release()
cv2.destroyAllWindows()
