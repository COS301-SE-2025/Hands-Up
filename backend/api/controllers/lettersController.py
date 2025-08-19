import sys
import struct
import cv2
import numpy as np
import pickle
import tensorflow as tf
import mediapipe as mp
import collections
import time
import os
from collections import deque
import pandas as pd # Added for words model

# --- Load all models and label encoders ---
lettersModel = tf.keras.models.load_model('../../ai_model/models/detectLettersModel.keras')
with open('../../ai_model/models/labelEncoder.pickle', 'rb') as f:
    labelEncoder = pickle.load(f)

lettersModel2 = tf.keras.models.load_model('../../ai_model/jz_model/JZModel.keras')
with open('../../ai_model/jz_model/labelEncoder.pickle', 'rb') as f:
    labelEncoder2 = pickle.load(f)

numbersModel = tf.keras.models.load_model('../../ai_model/models/detectNumbersModel.keras')
with open('../../ai_model/models/numLabelEncoder.pickle', 'rb') as f:
    numLabelEncoder = pickle.load(f)

# Load the new words model and its label encoder
wordsModel = tf.keras.models.load_model('../../ai_model3/models/best_sign_classifier_model_125_words_seq90.keras')
with open('../../ai_model3/models/best_sign_classifier_model_125_words_seq90_labelEncoder.pickle', 'rb') as f:
    wordsLabelEncoder = pickle.load(f)

hands = mp.solutions.hands.Hands(static_image_mode=True)

# Define words model parameters (from your provided handsUP.py)
SEQUENCE_LENGTH = 90
EXPECTED_COORDS_PER_FRAME = 63 # This is for your words model. Your handsUP.py had a much larger number, which needs to be clarified. I'm using 63 here to be consistent with the other letter models, but this may need adjustment if the words model expects a different input shape.
# Let's assume the words model expects a shape of (frames, 63) which is 21 landmarks * 3 coordinates (x,y,z)

def normalize_landmarks_words(landmarks_sequence):
    """
    Normalizes a sequence of landmarks for the words model.
    This is an adapted version of your provided normalization function.
    """
    if not landmarks_sequence:
        return np.zeros((SEQUENCE_LENGTH, EXPECTED_COORDS_PER_FRAME), dtype=np.float32)

    normalized_sequences = []
    for frame_landmarks in landmarks_sequence:
        if not frame_landmarks or np.all(frame_landmarks == 0):
            normalized_sequences.append(np.zeros(EXPECTED_COORDS_PER_FRAME, dtype=np.float32))
            continue
        
        # Reshape to 21 landmarks x 3 coordinates
        lms_array = np.array(frame_landmarks).reshape(-1, 3)

        # Normalize by translating to origin and scaling
        mean_coords = np.mean(lms_array, axis=0)
        translated_lms = lms_array - mean_coords
        scale_factor = np.max(np.linalg.norm(translated_lms, axis=1))
        
        if scale_factor > 1e-6:
            normalized_lms = translated_lms / scale_factor
        else:
            normalized_lms = translated_lms
        
        normalized_sequences.append(normalized_lms.flatten().astype(np.float32))
    
    return np.array(normalized_sequences, dtype=np.float32)

def detectFromImage(sequenceList, mode):
    """
    Detects signs from a sequence of images based on the specified mode.
    """
    if mode == 'fingerspelling':
        # Fingerspelling logic: use a single frame (the last one)
        # Note: Your client side code in processSignOrVideo sends a list of files for fingerspelling,
        # but the model only needs one, so we take the last one.
        fallback_frame = cv2.imread(sequenceList[-1])
        if fallback_frame is None:
            return {'letter': 'No Image', 'confidenceLetter': 0.0, 'number': 'No Image', 'confidenceNumber': 0.0}

        imgRGB = cv2.cvtColor(fallback_frame, cv2.COLOR_BGR2RGB)
        results = hands.process(imgRGB)
        
        if not results.multi_hand_landmarks:
            return {'letter': 'No Hand', 'confidenceLetter': 0.0, 'number': 'No Hand', 'confidenceNumber': 0.0}

        handLandmarks = results.multi_hand_landmarks[0]
        xList, yList = [], []
        dataAux = []

        for lm in handLandmarks.landmark:
            xList.append(lm.x)
            yList.append(lm.y)

        # Normalize landmarks for letters/numbers models
        for lm in handLandmarks.landmark:
            dataAux.append(lm.x - min(xList))
            dataAux.append(lm.y - min(yList))

        # Check in letters model 1
        inputData1 = np.array(dataAux, dtype=np.float32).reshape(1, 42, 1)
        prediction1 = lettersModel.predict(inputData1, verbose=0)
        index1 = np.argmax(prediction1, axis=1)[0]
        confidence1 = float(np.max(prediction1))
        label1 = labelEncoder.inverse_transform([index1])[0]

        # Check in numbers model
        prediction3 = numbersModel.predict(inputData1, verbose=0)
        index3 = np.argmax(prediction3, axis=1)[0]
        confidence3 = float(np.max(prediction3))
        label3 = numLabelEncoder.inverse_transform([index3])[0]
        
        return {
            'letter': label1, 
            'confidenceLetter': confidence1,
            'number': label3, 
            'confidenceNumber': confidence3
        }

    elif mode == 'words':
        # Words logic: process a sequence of 90 frames
        if len(sequenceList) != SEQUENCE_LENGTH:
            print("Incomplete sequence: ", len(sequenceList))
            return {'word': 'Incomplete Sequence', 'confidence': 0.0}
        
        processedSequence = []
        for imagePath in sequenceList:
            image = cv2.imread(imagePath)
            if image is None:
                continue 

            imgRGB = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = hands.process(imgRGB)

            if not results.multi_hand_landmarks:
                processedSequence.append(None)
                continue 

            handLandmarks = results.multi_hand_landmarks[0]
            dataAux = []

            for lm in handLandmarks.landmark:
                dataAux.append(lm.x)
                dataAux.append(lm.y)
                dataAux.append(lm.z) # Add z-coordinate for 3D data

            processedSequence.append(dataAux)

        # Interpolate missing frames
        for i in range(len(processedSequence)):
            if processedSequence[i] is None:
                prevIdx, nextIdx = -1, -1
                for j in range(i - 1, -1, -1):
                    if processedSequence[j] is not None:
                        prevIdx = j
                        break
                for j in range(i + 1, len(processedSequence)):
                    if processedSequence[j] is not None:
                        nextIdx = j
                        break
                
                if prevIdx != -1 and nextIdx != -1:
                    prevData = np.array(processedSequence[prevIdx])
                    nextData = np.array(processedSequence[nextIdx])
                    t = (i - prevIdx) / (nextIdx - prevIdx)
                    interpolatedData = prevData + (nextData - prevData) * t
                    processedSequence[i] = interpolatedData.tolist()
                elif prevIdx != -1:
                    processedSequence[i] = processedSequence[prevIdx]
                elif nextIdx != -1:
                    processedSequence[i] = processedSequence[nextIdx]
                else:
                    processedSequence[i] = [0.0] * EXPECTED_COORDS_PER_FRAME

        input_data = normalize_landmarks_words(processedSequence)
        input_data = input_data.reshape(1, SEQUENCE_LENGTH, EXPECTED_COORDS_PER_FRAME)
        
        prediction = wordsModel.predict(input_data, verbose=0)
        index = np.argmax(prediction, axis=1)[0]
        confidence = float(np.max(prediction))
        label = wordsLabelEncoder.inverse_transform([index])[0]

        return {'word': label, 'confidence': confidence}
    
    else:
        return {'error': 'Invalid mode specified'}, 400