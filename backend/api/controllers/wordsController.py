import cv2
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import mediapipe as mp

modelPath = '../../ai_model/words/saved_models/best_sign_classifier_model_40_words_seq90.keras'
csvPath = '../../ai_model/words/wlasl_40_words_personal_final_processed_data_augmented_seq90.csv'
sequenceLength = 30
expectedCoordsPerFrame = 1662
confidenceThreshold = 0.1

model = load_model(modelPath)
df = pd.read_csv(csvPath)
uniqueGlosses = df['gloss'].unique()
idToGloss = {i: g for i, g in enumerate(uniqueGlosses)}

mpHolistic = mp.solutions.holistic.Holistic(
    static_image_mode=True,
    model_complexity=1,
    min_detection_confidence=0.2,
    min_tracking_confidence=0.5
)

numPoseCoordsSingle = 33*4
numHandCoordsSingle = 21*3
numFaceCoordsSingle = 468*3

def normalizeLandmarks(landmarksSequence):
    if landmarksSequence.ndim == 1:
        landmarksSequence = np.expand_dims(landmarksSequence, axis=0)

    normalizedSequences = []
    for frameLandmarks in landmarksSequence:
        if np.all(frameLandmarks == 0):
            normalizedSequences.append(np.zeros(expectedCoordsPerFrame, dtype=np.float32))
            continue

        poseCoordsFlat = frameLandmarks[0 : numPoseCoordsSingle]
        leftHandCoordsFlat = frameLandmarks[numPoseCoordsSingle : numPoseCoordsSingle + numHandCoordsSingle]
        rightHandCoordsFlat = frameLandmarks[numPoseCoordsSingle + numHandCoordsSingle : numPoseCoordsSingle + numHandCoordsSingle*2]
        faceCoordsFlat = frameLandmarks[numPoseCoordsSingle + numHandCoordsSingle*2 : ]

        allPartsData = [
            (poseCoordsFlat, 4, [0.0]*numPoseCoordsSingle),
            (leftHandCoordsFlat, 3, [0.0]*numHandCoordsSingle),
            (rightHandCoordsFlat, 3, [0.0]*numHandCoordsSingle),
            (faceCoordsFlat, 3, [0.0]*numFaceCoordsSingle)
        ]

        normalizedFrameParts = []
        for flatLms, coordsPerLm, template in allPartsData:
            if np.all(flatLms == 0):
                normalizedFrameParts.append(np.array(template, dtype=np.float32))
                continue

            lmsArray = flatLms.reshape(-1, coordsPerLm)
            coordsForMean = lmsArray[:, :3] if coordsPerLm == 4 else lmsArray
            meanCoords = np.mean(coordsForMean, axis=0)
            translatedLms = lmsArray.copy()
            translatedLms[:, :3] -= meanCoords
            scaleFactor = np.max(np.linalg.norm(translatedLms[:, :3], axis=1))
            if scaleFactor > 1e-6:
                translatedLms[:, :3] /= scaleFactor
            normalizedFrameParts.append(translatedLms.flatten())

        combinedFrame = np.concatenate(normalizedFrameParts).astype(np.float32)
        if len(combinedFrame) < expectedCoordsPerFrame:
            combinedFrame = np.pad(combinedFrame, (0, expectedCoordsPerFrame - len(combinedFrame)), 'constant')
        elif len(combinedFrame) > expectedCoordsPerFrame:
            combinedFrame = combinedFrame[:expectedCoordsPerFrame]

        normalizedSequences.append(combinedFrame)

    return np.array(normalizedSequences, dtype=np.float32)

def padOrTruncateSequence(sequence, targetLength, featureDimension):
    if sequence.shape[0] < targetLength:
        padding = np.zeros((targetLength - sequence.shape[0], featureDimension), dtype=np.float32)
        return np.vstack((sequence, padding))
    return sequence[:targetLength, :]

def detectFromImageBytes(sequenceBytesList):
    sequence = []

    for idx, imageBytes in enumerate(sequenceBytesList):
        nparr = np.frombuffer(imageBytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            print(f"Warning: Could not decode image bytes at index {idx}")
            sequence.append(np.zeros(expectedCoordsPerFrame, dtype=np.float32))
            continue

        imgRgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mpResults = mpHolistic.process(imgRgb)

        frameLms = np.zeros(expectedCoordsPerFrame, dtype=np.float32)
        currentIdx = 0

        # 1. Pose Landmarks
        if mpResults.pose_landmarks:
            poseFlat = [coord for lm in mpResults.pose_landmarks.landmark for coord in [lm.x, lm.y, lm.z, lm.visibility]]
            frameLms[currentIdx:currentIdx + len(poseFlat)] = poseFlat
        else:
            print(f"Warning: No pose landmarks detected in frame {idx}")
        currentIdx += numPoseCoordsSingle

        # 2. Left Hand Landmarks (First Hand)
        if mpResults.left_hand_landmarks:
            lhFlat = [coord for lm in mpResults.left_hand_landmarks.landmark for coord in [lm.x, lm.y, lm.z]]
            frameLms[currentIdx:currentIdx + len(lhFlat)] = lhFlat
        else:
            print(f"Warning: No left hand landmarks detected in frame {idx}")
        currentIdx += numHandCoordsSingle

        # 3. Right Hand Landmarks (Second Hand)
        if mpResults.right_hand_landmarks:
            rhFlat = [coord for lm in mpResults.right_hand_landmarks.landmark for coord in [lm.x, lm.y, lm.z]]
            frameLms[currentIdx:currentIdx + len(rhFlat)] = rhFlat
        else:
            print(f"Warning: No right hand landmarks detected in frame {idx}")
        currentIdx += numHandCoordsSingle

        # 4. Face Landmarks
        if mpResults.face_landmarks:
            faceFlat = [coord for lm in mpResults.face_landmarks.landmark for coord in [lm.x, lm.y, lm.z]]
            frameLms[currentIdx:currentIdx + len(faceFlat)] = faceFlat
        else:
            print(f"Warning: No face landmarks detected in frame {idx}")

        sequence.append(frameLms)

    if not sequence:
        return {"word": "", "confidence": 0.0}

    sequence = normalizeLandmarks(np.array(sequence, dtype=np.float32))
    sequence = padOrTruncateSequence(sequence, sequenceLength, expectedCoordsPerFrame)
    sequence = np.expand_dims(sequence, axis=0)

    preds = model.predict(sequence, verbose=0)
    predictedId = int(np.argmax(preds))
    confidence = float(np.max(preds))
    predictedWord = idToGloss.get(predictedId, "Unknown")

    result = {"word": predictedWord if confidence >= confidenceThreshold else "",
              "confidence": confidence}

    print(f"Prediction result: {result}")
    return result