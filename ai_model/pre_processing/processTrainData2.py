import csv
import pickle

csv_file_path = '../letters2/sign_mnist_train.csv'
int_to_letter = [chr(i) for i in range(65, 93)]  

data = []
labels = []

with open(csv_file_path, 'r') as f:
    reader = csv.reader(f)
    headers = next(reader) 

    for row in reader:
        label = row[0]
        pixels = list(map(int, row[1:]))

        if len(pixels) != 784:
            print(f"Skipping row with {len(pixels)} pixels.")
            continue

        #normalize to [0, 1]
        normalized_pixels = [p / 255.0 for p in pixels]

        data.append(normalized_pixels)
        labels.append(int_to_letter[int(label)])
        print(label, "is", int_to_letter[int(label)])


print("Loaded", len(data), "samples.")
print("Sample labels:", list(set(labels)))

with open('../processed_data/trainData2.pickle', 'wb') as f:
    pickle.dump({'data': data, 'labels': labels}, f)
