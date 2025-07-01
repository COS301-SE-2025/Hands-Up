# import pytest
# import sys
# import os
# from unittest.mock import MagicMock, patch
# from collections import namedtuple

# parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../backend/api/controllers'))
# sys.path.append(parent_dir)

# from modelControllers import ZGestureStateMachine, JGestureStateMachine, detectFromImage  

# Landmark = namedtuple('Landmark', ['x', 'y'])

# def create_landmarks(index_tip=(0.6, 0.5), wrist=(0.5, 0.5), pinky_tip=(0.4, 0.6)):
#     landmarks = [Landmark(*wrist)] * 21
#     landmarks[8] = Landmark(*index_tip)  
#     landmarks[20] = Landmark(*pinky_tip)  
#     return landmarks

# def test_z_gesture_success():
#     z = ZGestureStateMachine()
#     assert z.update(create_landmarks(index_tip=(0.6, 0.5))) == False 
#     assert z.state == 1
#     assert z.update(create_landmarks(index_tip=(0.7, 0.6))) == False 
#     assert z.state == 2
#     assert z.update(create_landmarks(index_tip=(0.8, 0.6))) == True  
#     assert z.state == 3

# def test_z_gesture_timeout():
#     z = ZGestureStateMachine()
#     for _ in range(11):
#         z.update(create_landmarks(index_tip=(0.6, 0.5)))
#     assert z.state == 1 


# def test_j_gesture_success():
#     j = JGestureStateMachine()
#     assert j.update(create_landmarks(pinky_tip=(0.5, 0.7))) == False 
#     assert j.state == 1
#     assert j.update(create_landmarks(pinky_tip=(0.3, 0.7))) == True   
#     assert j.state == 2

# def test_j_gesture_timeout():
#     j = JGestureStateMachine()
#     for _ in range(11):
#         j.update(create_landmarks(pinky_tip=(0.5, 0.7)))
#     assert j.state == 0  


# @patch('modelControllers.mp.solutions.hands.Hands')
# @patch('modelControllers.cv2.imread')
# @patch('modelControllers.cv2.cvtColor')
# @patch('modelControllers.model.predict')
# @patch('modelControllers.labelEncoder')
# def test_detect_from_image(mock_label_encoder, mock_predict, mock_cvtColor, mock_imread, mock_hands):
#     mock_imread.return_value = MagicMock()
#     mock_cvtColor.return_value = MagicMock()

#     landmark = Landmark(0.5, 0.5)
#     fake_landmarks = [landmark] * 21
#     hand_landmarks = MagicMock()
#     hand_landmarks.landmark = fake_landmarks

#     mock_context = MagicMock()
#     mock_context.__enter__.return_value.process.return_value.multi_hand_landmarks = [hand_landmarks]
#     mock_hands.return_value = mock_context

#     mock_predict.return_value = [[0.1, 0.9]]
#     mock_label_encoder.inverse_transform.return_value = ['J']

#     result = detectFromImage("fake_image_path.jpg")
#     assert result['phrase'] in ('Z', 'J', 'Nothing detected')
