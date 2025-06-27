import pickle
import numpy as np
from collections import defaultdict

with open("../processed_data/trainData.pickle", "rb") as f:
    dataset = pickle.load(f) 

data = dataset["data"]
labels = dataset["labels"]

grouped = defaultdict(list)
for landmarks, label in zip(data, labels):
    grouped[label].append(landmarks)

referenceLandmarks = {}
for label, samples in grouped.items():
    avg = np.mean(samples, axis=0)
    referenceLandmarks[label] = avg.tolist()

with open("../processed_data/landmarksReference.pickle", "wb") as f:
    pickle.dump(referenceLandmarks, f)

