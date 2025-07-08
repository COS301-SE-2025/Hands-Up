import generateSequence
import lstmNetwork      

def processAndTrain():
    print("📦 Step 1: Preprocessing data")
    generateSequence.getKeypoints()  

    print("🎯 Step 2: Starting training")
    lstmNetwork.run_incremental_learning()
