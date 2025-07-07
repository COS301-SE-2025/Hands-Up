import pickle
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from tensorflow.keras.callbacks import EarlyStopping

early_stop = EarlyStopping(patience=2, restore_best_weights=True)

#process first data set
dataDictTrain = pickle.load(open('../processed_data/trainData.pickle', 'rb'))

cleanedData = []
cleanedLabels = []
for i, item in enumerate(dataDictTrain['data']):
    if isinstance(item, (np.ndarray, list)) and len(item) == 42:
        cleanedData.append(np.array(item, dtype=np.float32))
        cleanedLabels.append(dataDictTrain['labels'][i])

xTrain = np.array(cleanedData)
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

#second data set for finetuning
dataDictTrain2 = pickle.load(open('../processed_data/fineTuneData.pickle', 'rb'))

cleanedData2 = []
cleanedLabels2 = []
for i, item in enumerate(dataDictTrain2['data']):
    if isinstance(item, (np.ndarray, list)) and len(item) == 42:
        cleanedData2.append(np.array(item, dtype=np.float32))
        cleanedLabels2.append(dataDictTrain2['labels'][i])

xTrain2 = np.stack(cleanedData2)
yTrainRaw2= np.array(cleanedLabels2)

xTrain2 = xTrain2.reshape(-1, 42, 1)

labelEncoder2 = LabelEncoder()
labelEncoder2.fit(yTrainRaw2)

yTrainEncoded2 = labelEncoder2.transform(yTrainRaw2)

model = tf.keras.models.Sequential([
    tf.keras.layers.Conv1D(32, kernel_size=3, activation='relu', input_shape=(42, 1)),
    tf.keras.layers.MaxPooling1D(pool_size=2),
    tf.keras.layers.Conv1D(64, kernel_size=3, activation='relu'),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(len(labelEncoder.classes_), activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(xTrain, yTrainEncoded, epochs=15, batch_size=32, validation_split=0.2)

for layer in model.layers[:-2]:
    layer.trainable = False

model.compile(optimizer=tf.keras.optimizers.Adam(1e-5),loss='sparse_categorical_crossentropy',metrics=['accuracy'])

yTrainEncoded2 = labelEncoder2.transform(yTrainRaw2)

model.fit(xTrain2, yTrainEncoded2, epochs=10, batch_size=32, validation_split=0.2, callbacks = [early_stop])

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