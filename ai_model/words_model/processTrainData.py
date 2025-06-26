import os
import pickle
import cv2
import mediapipe as mp

mpHolistic = mp.solutions.holistic
mpDrawing = mp.solutions.drawing_utils

DATADIR = './words-subset'
processedData = {}

with mpHolistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:

    for word in os.listdir(DATADIR):
        wordDir = os.path.join(DATADIR, word)
        print(f"Processing word: {word}")
        wordLandmarks = []

        for videoName in os.listdir(wordDir):
            videoPath = os.path.join(wordDir, videoName)
            cap = cv2.VideoCapture(videoPath)

            if not cap.isOpened():
                print(f"Failed to open video: {videoPath}")
                continue

            frameCount = 0
            videoFrames = []

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                frameCount += 1
                imgRgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = holistic.process(imgRgb)

                leftHandLandmarks = []
                rightHandLandmarks = []
                faceLandmarks = []
                poseLandmarks = []

                if results.left_hand_landmarks:
                    xCoords = [lm.x for lm in results.left_hand_landmarks.landmark]
                    yCoords = [lm.y for lm in results.left_hand_landmarks.landmark]
                    normalized = [
                        (lm.x - min(xCoords), lm.y - min(yCoords)) for lm in results.left_hand_landmarks.landmark
                    ]
                    leftHandLandmarks = [val for tup in normalized for val in tup]

                if results.right_hand_landmarks:
                    xCoords = [lm.x for lm in results.right_hand_landmarks.landmark]
                    yCoords = [lm.y for lm in results.right_hand_landmarks.landmark]
                    normalized = [
                        (lm.x - min(xCoords), lm.y - min(yCoords)) for lm in results.right_hand_landmarks.landmark
                    ]
                    rightHandLandmarks = [val for tup in normalized for val in tup]

                if results.pose_landmarks:
                    xCoords = [lm.x for lm in results.pose_landmarks.landmark]
                    yCoords = [lm.y for lm in results.pose_landmarks.landmark]
                    normalized = [
                        (lm.x - min(xCoords), lm.y - min(yCoords)) for lm in results.pose_landmarks.landmark
                    ]
                    poseLandmarks = [val for tup in normalized for val in tup]

                videoFrames.append({
                    "leftHandLandmarks": leftHandLandmarks,
                    "rightHandLandmarks": rightHandLandmarks,
                    "poseLandmarks": poseLandmarks,
                    "videoName": videoName,
                    "frame": frameCount
                })

            cap.release()

            activeIndices = [
                i for i, frame in enumerate(videoFrames)
                if (frame["leftHandLandmarks"] or frame["rightHandLandmarks"])
            ]

            if activeIndices:
                start = activeIndices[0]
                end = activeIndices[-1] + 1  
                trimmedFrames = videoFrames[start:end]
                wordLandmarks.extend(trimmedFrames)
            else:
                print(f"No hand activity found in {videoName}")

        processedData[word] = wordLandmarks

os.makedirs('./processed_data', exist_ok=True)
with open('./processed_data/landmarksByWordVideos.pickle', 'wb') as f:
    pickle.dump(processedData, f)

print("Finished processing. Words saved:", list(processedData.keys()))
