import os
import pickle

import mediapipe as mp
import cv2
import matplotlib.pyplot as plt

mpHands = mp.solutions.hands
mpDrawing = mp.solutions.drawing_utils
mpDrawingStyles = mp.solutions.drawing_styles

def brighten_image(img, factor=1.5):
    return cv2.convertScaleAbs(img, alpha=factor, beta=20)

hands = mpHands.Hands(static_image_mode=True, min_detection_confidence=0.3)

DATADIR = './data/asl_alphabet_test'

data = []
labels = []
for dir in os.listdir(DATADIR):
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

        img = cv2.imread(imgPath)
        enhanced = brighten_image(img)
        imgRGB = cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB)

        results = hands.process(imgRGB)
        if results.multi_hand_landmarks:
            for handLandmarks in results.multi_hand_landmarks:
                
                mpDrawing.draw_landmarks(
                    img,  
                    handLandmarks,
                    mpHands.HAND_CONNECTIONS,
                    mpDrawingStyles.get_default_hand_landmarks_style(),
                    mpDrawingStyles.get_default_hand_connections_style()
                )

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

            ind = imgName.find("test")

            data.append(dataAux)
            labels.append(imgName[0:ind-1].upper())

            cv2.imshow("Hand Landmarks", img)
            cv2.waitKey(0)
            cv2.destroyAllWindows() 
    
print(labels)

file = open('./processed_data/testData.pickle', 'wb')
pickle.dump({'data': data, 'labels': labels}, file)
file.close()

