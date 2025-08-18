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
1) python wlasl_parser.py is run which aims to identify the missing videos in the WLASL dataset. THese are outlined in missing.txt and will affect the accurcay of the model if not done.
2
