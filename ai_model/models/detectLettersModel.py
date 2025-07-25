import pickle
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

dataDictTrain = pickle.load(open('../processed_data/trainData.pickle', 'rb'))

cleanedData = []
cleanedLabels = []
for i, item in enumerate(dataDictTrain['data']):
    if isinstance(item, (np.ndarray, list)) and len(item) == 42:
        cleanedData.append(np.array(item, dtype=np.float32))
        cleanedLabels.append(dataDictTrain['labels'][i])

xTrain = np.stack(cleanedData)
yTrainRaw = np.array(cleanedLabels)

dataDictTest = pickle.load(open('../processed_data/testData.pickle', 'rb'))
xTestRaw = np.array(dataDictTest['data'], dtype=np.float32)
yTestRaw = np.array(dataDictTest['labels'])

xTrain = xTrain.reshape(-1, 42, 1)
xTest = xTestRaw.reshape(-1, 42, 1)

labelEncoder = LabelEncoder()
labelEncoder.fit(yTrainRaw)

yTrainEncoded = labelEncoder.transform(yTrainRaw)
yTestEncoded = labelEncoder.transform(yTestRaw)

model = tf.keras.models.Sequential([
    tf.keras.layers.Conv1D(32, kernel_size=3, activation='relu', input_shape=(42, 1)),
    tf.keras.layers.MaxPooling1D(pool_size=2),
    tf.keras.layers.Conv1D(64, kernel_size=3, activation='relu'),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(len(labelEncoder.classes_), activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(xTrain, yTrainEncoded, epochs=15, batch_size=32, validation_split=0)

testLoss, testAccuracy = model.evaluate(xTest, yTestEncoded)
print(f"\nTest accuracy: {testAccuracy * 100:.2f}%")

predictions = model.predict(xTest)
predictedIndex = np.argmax(predictions, axis=1)
predictedLabels = labelEncoder.inverse_transform(predictedIndex)

print("\nPredictions:")
for i, pred in enumerate(predictedLabels):
    print(f"Image {i}: Predicted = {pred}, Actual = {yTestRaw[i]}")

model.save("detectLettersModel.keras")
with open("labelEncoder.pickle", "wb") as file:
    pickle.dump(labelEncoder, file)