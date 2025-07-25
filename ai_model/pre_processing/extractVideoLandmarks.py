import cv2
import mediapipe as mp
import json
import os

def extractLandmarksFromVideo(videoPath, letter, outputDir='landmarks'):
    mpHands = mp.solutions.hands
    hands = mpHands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)
    cap = cv2.VideoCapture(videoPath)

    landmarksData = []

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.flip(frame, 1)
        imageRgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        results = hands.process(imageRgb)

        frameLandmarks = []
        if results.multi_hand_landmarks:
            handLandmarks = results.multi_hand_landmarks[0]
            for lm in handLandmarks.landmark:
                frameLandmarks.append({
                    "x": lm.x,
                    "y": lm.y,
                    "z": lm.z,
                })

        if frameLandmarks:
            landmarksData.append(frameLandmarks)

    cap.release()
    hands.close()

    os.makedirs(outputDir, exist_ok=True)
    outputFilename = f"{letter.upper()}.json"
    outputPath = os.path.join(outputDir, outputFilename)
    with open(outputPath, "w") as f:
        json.dump({"frames": landmarksData}, f, indent=2)

    print(f"Saved landmarks to {outputPath}")

def processAllVideosInDirectory(videoDirectory, outputDirectory='landmarks'):
    if not os.path.isdir(videoDirectory):
        print(f"Error: Video directory '{videoDirectory}' not found.")
        return

    os.makedirs(outputDirectory, exist_ok=True)

    for filename in os.listdir(videoDirectory):
        if filename.lower().endswith(('.mp4')): 
            videoPath = os.path.join(videoDirectory, filename)
            letter = os.path.splitext(filename)[0]
            print(f"Processing video: {filename} for letter: {letter}")
            extractLandmarksFromVideo(videoPath, letter, outputDirectory)
        else:
            print(f"Skipping non-video file: {filename}")

if __name__ == "__main__":
    videoInputDirectory = "../video_data" 
    landmarkOutputDirectory = "../processed_data/landmarks"
    
    processAllVideosInDirectory(videoInputDirectory, landmarkOutputDirectory)