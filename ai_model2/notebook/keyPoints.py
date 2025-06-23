import numpy as np
import os


def extract_keypoints(results):
    """Extracts and flattens landmarks into a single numpy array"""
    pose = np.array([[res.x, res.y, res.z, res.visibility] 
                    for res in results.pose_landmarks.landmark]).flatten() \
                    if results.pose_landmarks else np.zeros(33*4)
    
    face = np.array([[res.x, res.y, res.z] 
                    for res in results.face_landmarks.landmark]).flatten() \
                    if results.face_landmarks else np.zeros(468*3)
    
    lh = np.array([[res.x, res.y, res.z] 
                  for res in results.left_hand_landmarks.landmark]).flatten() \
                  if results.left_hand_landmarks else np.zeros(21*3)
    
    rh = np.array([[res.x, res.y, res.z] 
                  for res in results.right_hand_landmarks.landmark]).flatten() \
                  if results.right_hand_landmarks else np.zeros(21*3)
    
    return np.concatenate([pose, face, lh, rh])
