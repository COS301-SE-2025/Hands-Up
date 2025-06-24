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
    """
    Processes all video files in a given directory to extract hand landmarks.

    Args:
        videoDirectory (str): The path to the directory containing video files.
        outputDirectory (str): The directory where JSON landmark files will be saved.
    """
    if not os.path.isdir(videoDirectory):
        print(f"Error: Video directory '{videoDirectory}' not found.")
        return

    # Create the output directory if it doesn't exist
    os.makedirs(outputDirectory, exist_ok=True)

    for filename in os.listdir(videoDirectory):
        if filename.lower().endswith(('.mp4')): # Add other video extensions if needed
            videoPath = os.path.join(videoDirectory, filename)
            # Extract the letter from the filename (e.g., "A.mp4" -> "A")
            letter = os.path.splitext(filename)[0]
            print(f"Processing video: {filename} for letter: {letter}")
            extractLandmarksFromVideo(videoPath, letter, outputDirectory)
        else:
            print(f"Skipping non-video file: {filename}")

# Example usage
if __name__ == "__main__":
    videoInputDirectory = "../video_data" # Assuming your videos are in a folder named 'videos'
    landmarkOutputDirectory = "../processed_data/landmarks" # Output directory for JSON files
    
    processAllVideosInDirectory(videoInputDirectory, landmarkOutputDirectory)