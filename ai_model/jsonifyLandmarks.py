import pickle
import json

# Load pickle file
with open('processed_data/testData.pickle', 'rb') as f:
    data = pickle.load(f)

json_data = []
for frame, label in zip(data['data'], data['labels']):
    landmarks = [
        {'x': frame[i], 'y': frame[i+1], 'z': frame[i+2]}
        for i in range(0, len(frame), 3)
    ]
    json_data.append({'label': label, 'landmarks': landmarks})

# Save as JSON
with open('processed_data/landmarks.json', 'w') as f:
    json.dump(json_data, f)
