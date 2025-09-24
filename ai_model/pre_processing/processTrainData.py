import os
import pickle

import mediapipe as mp
import cv2
import matplotlib.pyplot as plt

mpHands = mp.solutions.hands
mpDrawing = mp.solutions.drawing_utils
mpDrawingStyles = mp.solutions.drawing_styles

hands = mpHands.Hands(static_image_mode=True, min_detection_confidence=0.3)

DATADIR = '../numbers/nums_train'

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

        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = hands.process(imgRGB)

        if results.multi_hand_landmarks:
            for hand_idx, handLandmarks in enumerate(results.multi_hand_landmarks):
                # check handedness
                handedness = results.multi_handedness[hand_idx].classification[0].label

                # collect coordinates
                x_ = []
                y_ = []
                for lm in handLandmarks.landmark:
                    x = lm.x
                    y = lm.y
                    x_.append(x)
                    y_.append(y)

                # if left hand, flip horizontally across the midline
                if handedness == "Left":
                    x_ = [1 - x for x in x_]

                # normalize
                for i in range(len(x_)):
                    dataAux.append(x_[i] - min(x_))
                    dataAux.append(y_[i] - min(y_))

                data.append(dataAux)
                labels.append(dir.strip().upper())

                # Optional visualization
                # mpDrawing.draw_landmarks(
                #     img, handLandmarks, mpHands.HAND_CONNECTIONS,
                #     mpDrawingStyles.get_default_hand_landmarks_style(),
                #     mpDrawingStyles.get_default_hand_connections_style()
                # )
                # cv2.imshow("Hand", img)
                # cv2.waitKey(0)

print(labels)

file = open('../processed_data/numTrainData.pickle', 'wb')
pickle.dump({'data': data, 'labels': labels}, file)
file.close()
