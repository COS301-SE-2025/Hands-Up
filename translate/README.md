TO set up the enviroment:
python -m venv venv_signlang
  your should see (venv-signlang)
run: pip install numpy opencv-python mediapipe pandas
next run:  python.exe
and to check if its working :>>>
>>> import numpy
>>> import cv2
>>> import mediapipe
>>> import pandas
>>> print("All libraries imported successfully!")
you should see : All libraries imported successfully!

ENVIROMENT SETUP COMPLETE!!!


next add all files into root
-venv_signlang
-videos
-missing.txt
nslt_100.json
nslt_300.json
nslt_1000.json
nslt_2000.json
wlasl_class_list.txt
WLASL_v0.3.json
and add 2 new files:
data_explorer.py
WLASL_parser.py

THis outlines how the code works:
1) (You may not need to but its what i have) add videos folder from the dataset to translate folder and cd into the translate page
2) create a virtual enviroment called venv_signlang and install the required libraries( please add a list of all libraries needed when you do this as i am not sure)
3) in the virtual enviroment run : python train_classifier.py to run the model. Here is what it should look like when you run:

(python train_classifier.py
2025-07-08 13:04:27.753245: I tensorflow/core/util/port.cc:153] oneDNN custom operations are on. You may see slightly different numerical results due to floating-point round-off errors from different computation orders. To turn them off, set the environment variable `TF_ENABLE_ONEDNN_OPTS=0`.
2025-07-08 13:04:29.039526: I tensorflow/core/util/port.cc:153] oneDNN custom operations are on. You may see slightly different numerical results due to floating-point round-off errors from different computation orders. To turn them off, set the environment variable `TF_ENABLE_ONEDNN_OPTS=0`.
Loaded 3257 entries from wlasl_nslt_100_final_processed_data_augmented.csv
Train samples (including augmented): 2992
Validation samples: 165
Test samples: 100
Loading processed data: 100%|█████████| 2992/2992 [00:05<00:00, 535.45it/s] 
Loading processed data: 100%|███████████| 165/165 [00:00<00:00, 226.08it/s]
Loading processed data: 100%|███████████| 100/100 [00:00<00:00, 374.91it/s]

Loaded data shapes:
X_train: (2992, 60, 1662), y_train: (2992,)
X_val: (165, 60, 1662), y_val: (165,)
X_test: (100, 60, 1662), y_test: (100,)
Number of unique classes: 100
y_train (one-hot) shape: (2992, 100)
y_val (one-hot) shape: (165, 100)
2025-07-08 13:04:39.666194: I tensorflow/core/platform/cpu_feature_guard.cc:210] This TensorFlow binary is optimized to use available CPU instructions in performance-critical operations.
To enable the following instructions: SSE3 SSE4.1 SSE4.2 AVX AVX2 AVX512F AVX512_VNNI FMA, in other operations, rebuild TensorFlow with the appropriate compiler flags.
C:\Users\User\OneDrive\Desktop\translate\venv_signlang\Lib\site-packages\keras\src\layers\rnn\rnn.py:199: UserWarning: Do not pass an `input_shape`/`input_dim` argument to a layer. When using Sequential models, prefer using an `Input(shape)` object as the first layer in the model instead.
  super().__init__(**kwargs)
Model: "sequential"
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━┓
┃ Layer (type)                  ┃ Output Shape          ┃      Param # ┃    
┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━┩    
│ lstm (LSTM)                   │ (None, 60, 128)       │      916,992 │    
├───────────────────────────────┼───────────────────────┼──────────────┤    
│ batch_normalization           │ (None, 60, 128)       │          512 │    
│ (BatchNormalization)          │                       │              │    
├───────────────────────────────┼───────────────────────┼──────────────┤    
│ dropout (Dropout)             │ (None, 60, 128)       │            0 │    
├───────────────────────────────┼───────────────────────┼──────────────┤    
│ lstm_1 (LSTM)                 │ (None, 128)           │      131,584 │    
├───────────────────────────────┼───────────────────────┼──────────────┤    
│ batch_normalization_1         │ (None, 128)           │          512 │    
│ (BatchNormalization)          │                       │              │    
├───────────────────────────────┼───────────────────────┼──────────────┤    
│ dropout_1 (Dropout)           │ (None, 128)           │            0 │    
├───────────────────────────────┼───────────────────────┼──────────────┤    
│ dense (Dense)                 │ (None, 128)           │       16,512 │    
├───────────────────────────────┼───────────────────────┼──────────────┤    
│ batch_normalization_2         │ (None, 128)           │          512 │    
│ (BatchNormalization)          │                       │              │    
├───────────────────────────────┼───────────────────────┼──────────────┤    
│ dropout_2 (Dropout)           │ (None, 128)           │            0 │    
├───────────────────────────────┼───────────────────────┼──────────────┤    
│ dense_1 (Dense)               │ (None, 100)           │       12,900 │    
└───────────────────────────────┴───────────────────────┴──────────────┘    
 Total params: 1,079,524 (4.12 MB)
 Trainable params: 1,078,756 (4.12 MB)
 Non-trainable params: 768 (3.00 KB)

Starting model training with BATCH_SIZE=32 and EPOCHS=100...
Epoch 1/100
94/94 ━━━━━━━━━━━━━━━━━━━━ 0s 175ms/step - accuracy: 0.0114 - loss: 5.7625 
Epoch 1: val_accuracy improved from -inf to 0.00606, saving model to saved_models\best_sign_classifier_model.keras
94/94 ━━━━━━━━━━━━━━━━━━━━ 24s 189ms/step - accuracy: 0.0114 - loss: 5.7619 - val_accuracy: 0.0061 - val_loss: 4.8550 - learning_rate: 5.0000e-04       
Epoch 2/100
 1/94 ━━━━━━━━━━━━━━━━━━━━ 16s 176ms/step - accuracy: 0.0000e+00 - loss: 5.5 2/94 ━━━━━━━━━━━━━━━━━━━━ 12s 140ms/step - accuracy: 0.0078 - loss: 5.4368 
94/94 ━━━━━━━━━━━━━━━━━━━━ 0s 154ms/step - accuracy: 0.0143 - loss: 5.4274 
Epoch 2: val_accuracy improved from 0.00606 to 0.01212, saving model to saved_models\best_sign_classifier_model.keras
94/94 ━━━━━━━━━━━━━━━━━━━━ 15s 160ms/step - accuracy: 0.0144 - loss: 5.4270 - val_accuracy: 0.0121 - val_loss: 4.8620 - learning_rate: 5.0000e-04       
Epoch 3/100
 1/94 ━━━━━━━━━━━━━━━━━━━━ 16s 174ms/step - accuracy: 0.0000e+00 - loss: 5.0 2/94 ━━━━━━━━━━━━━━━━━━━━ 12s 141ms/step - accuracy: 0.0000e+00 - loss: 5.1 3/94 ━━━━━━━━━━━━━━━━━━━━ 13s 153ms/step - accuracy: 0.0000e+00 - loss: 5.1 4/94 ━━━━━━━━━━━━━━━━━━━━ 14s 156ms/step - accuracy: 0.0020 - loss: 5.2123 
94/94 ━━━━━━━━━━━━━━━━━━━━ 0s 138ms/step - accuracy: 0.0212 - loss: 5.2145 
Epoch 3: val_accuracy improved from 0.01212 to 0.02424, saving model to saved_models\best_sign_classifier_model.keras
94/94 ━━━━━━━━━━━━━━━━━━━━ 13s 143ms/step - accuracy: 0.0212 - loss: 5.2138 - val_accuracy: 0.0242 - val_loss: 4.8717 - learning_rate: 5.0000e-04       )
