import pickle

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np

dataDictTrain = pickle.load(open('./train.data.pickle', 'rb'))

cleaned_data = []
cleaned_labels = []
for i, item in enumerate(dataDictTrain['data']):
    if isinstance(item, (np.ndarray, list)) and len(item) == 42:
        cleaned_data.append(np.array(item, dtype=np.float32))
        cleaned_labels.append(dataDictTrain['labels'][i])  

dataTrain = np.stack(cleaned_data)
labelsTrain = np.stack(cleaned_labels)

print(dataTrain.shape)    
print(labelsTrain.shape)

# xTrain, yTrain = train_test_split(data, labels, test_size=0.2, shuffle=True, stratify=labels)
xTrain = dataTrain
yTrain = labelsTrain

dataDictTest = pickle.load(open('./test.data.pickle', 'rb'))

dataTest = np.asarray(dataDictTest['data'])
labelsTest = np.asarray(dataDictTest['labels'])

xTest = dataTest
yTest = labelsTest

model = RandomForestClassifier()

model.fit(dataTrain, labelsTrain)

print(dataTest.shape)    

yPredict = model.predict(xTest)

score = accuracy_score(yPredict, yTest)

print('{}% of samples were classified correctly!'.format(score * 100))

f = open('model.p', 'wb')
pickle.dump({'model': model}, f)
f.close()