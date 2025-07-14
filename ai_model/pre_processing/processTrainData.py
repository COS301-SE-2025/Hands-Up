import os
import pickle

import mediapipe as mp
import cv2
import matplotlib.pyplot as plt

mpHands = mp.solutions.hands
mpDrawing = mp.solutions.drawing_utils
mpDrawingStyles = mp.solutions.drawing_styles

hands = mpHands.Hands(static_image_mode=True, min_detection_confidence=0.3)

DATADIR = '../numbers/nums_test'

data = []
labels = []
for dir in os.listdir(DATADIR):
    #if dir.strip().upper() == 'C': #Starting with C because dataset too big
    for imgName in os.listdir(os.path.join(DATADIR, dir)):
        dataAux = []

        x_ = []
        y_ = []

        imgPath = os.path.join(DATADIR, dir, imgName)
        print("Reading:", imgPath)

        img = cv2.imread(imgPath)
        if img is None:
            print("Failed to load:", imgPath)
            continue  

        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        results = hands.process(imgRGB)
        if results.multi_hand_landmarks:
            for handLandmarks in results.multi_hand_landmarks:
                
                for i in range(len(handLandmarks.landmark)):
                    x = handLandmarks.landmark[i].x
                    y = handLandmarks.landmark[i].y

                    x_.append(x)
                    y_.append(y)

                for i in range(len(handLandmarks.landmark)):
                    x = handLandmarks.landmark[i].x
                    y = handLandmarks.landmark[i].y
                    dataAux.append(x - min(x_))
                    dataAux.append(y - min(y_))

            data.append(dataAux)
            labels.append(dir.strip().upper())

            # cv2.imshow("Hand Landmarks", img)
            # cv2.waitKey(0)
print(labels)

file = open('../processed_data/numTestData.pickle', 'wb')
pickle.dump({'data': data, 'labels': labels}, file)
file.close()

