import os
import sys
import cv2
import numpy as np
import mediapipe as mp
import json
import argparse
from pathlib import Path
import time
from collections import deque, Counter
import traceback

print("Python script started", flush=True)
print(f"Python version: {sys.version}", flush=True)
print(f"Working directory: {os.getcwd()}", flush=True)
print(f"Script arguments: {sys.argv}", flush=True)

# Constants
SEQUENCE_LENGTH = 30
MIN_DETECTION_CONFIDENCE = 0.3
MIN_TRACKING_CONFIDENCE = 0.3
CONFIDENCE_SMOOTHING_WINDOW = 5
MIN_SEQUENCE_CONFIDENCE = 0.2

class SignLanguageDetector:
    def __init__(self, model_path='action_model.h5', processed_path='../processed_dataset'):
        print("Initializing SignLanguageDetector...", flush=True)
        
        self.script_dir = Path(__file__).parent.absolute()
        self.model_path = self.script_dir / model_path
        self.processed_path = self.script_dir / processed_path
        
        print(f"Script directory: {self.script_dir}", flush=True)
        print(f"Model path: {self.model_path}", flush=True)
        print(f"Processed path: {self.processed_path}", flush=True)
        
        # Check if paths exist
        if not self.model_path.exists():
            print(f"Model not found at: {self.model_path}", flush=True)
            raise FileNotFoundError(f"Model file not found at {self.model_path}")
        
        if not self.processed_path.exists():
            print(f"Processed dataset not found at: {self.processed_path}", flush=True)
            raise FileNotFoundError(f"Processed dataset not found at {self.processed_path}")
        
        print("Initializing MediaPipe...", flush=True)
        # Initialize MediaPipe
        self.mp_holistic = mp.solutions.holistic
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Load model and actions
        print("Loading model and actions...", flush=True)
        self.model, self.actions = self._load_assets()
        
        print("Creating holistic detector...", flush=True)
        self.holistic = self.mp_holistic.Holistic(
            min_detection_confidence=MIN_DETECTION_CONFIDENCE,
            min_tracking_confidence=MIN_TRACKING_CONFIDENCE,
            model_complexity=1,
            smooth_landmarks=True
        )
        
        # Prediction smoothing
        self.confidence_buffer = deque(maxlen=CONFIDENCE_SMOOTHING_WINDOW)
        self.last_valid_keypoints = None
        self.frames_without_detection = 0
        self.max_frames_without_detection = 10
        
        # Visualization
        self.visualize = False
        
        print("SignLanguageDetector initialized successfully", flush=True)
    
    def _load_assets(self):
        """Load model and action labels with error handling"""
        try:
            print("Loading TensorFlow model...", flush=True)
            from tensorflow.keras.models import load_model
            print("TensorFlow imported successfully", flush=True)
            
            print(f"Loading model from: {self.model_path}", flush=True)
            model = load_model(str(self.model_path))
            print("Model loaded successfully", flush=True)
            
            print("Loading action labels...", flush=True)
            actions = sorted([
                folder for folder in os.listdir(self.processed_path) 
                if (self.processed_path / folder).is_dir()
            ])
            
            print(f"Found {len(actions)} actions: {actions}", flush=True)
            return model, actions
            
        except Exception as e:
            print(f"Error loading assets: {e}", flush=True)
            print(f"Traceback: {traceback.format_exc()}", flush=True)
            raise
    
    def _preprocess_frame(self, frame):
        """Enhance frame for better detection"""
        try:
            h, w = frame.shape[:2]
            if h != w:
                size = max(h, w)
                squared = np.zeros((size, size, 3), dtype=np.uint8)
                offset_h = (size - h) // 2
                offset_w = (size - w) // 2
                squared[offset_h:offset_h+h, offset_w:offset_w+w] = frame
                frame = squared
            
            frame = cv2.resize(frame, (640, 640))
            ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
            ycrcb[:,:,0] = cv2.equalizeHist(ycrcb[:,:,0])
            return cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2RGB)
        except Exception as e:
            print(f"Error preprocessing frame: {e}", flush=True)
            return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    def _draw_landmarks(self, image, results):
        """Draw MediaPipe landmarks on the image"""
        if results is None:
            return image
        
        try:
            # Draw pose landmarks
            self.mp_drawing.draw_landmarks(
                image,
                results.pose_landmarks,
                self.mp_holistic.POSE_CONNECTIONS,
                self.mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2),
                self.mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
            )
            
            # Draw face landmarks
            self.mp_drawing.draw_landmarks(
                image,
                results.face_landmarks,
                self.mp_holistic.FACEMESH_TESSELATION,
                self.mp_drawing.DrawingSpec(color=(80,110,10), thickness=1, circle_radius=1),
                self.mp_drawing.DrawingSpec(color=(80,256,121), thickness=1, circle_radius=1)
            )
            
            # Draw hand landmarks
            self.mp_drawing.draw_landmarks(
                image,
                results.left_hand_landmarks,
                self.mp_holistic.HAND_CONNECTIONS,
                self.mp_drawing.DrawingSpec(color=(121,22,76), thickness=2, circle_radius=4),
                self.mp_drawing.DrawingSpec(color=(121,44,250), thickness=2, circle_radius=2)
            )
            self.mp_drawing.draw_landmarks(
                image,
                results.right_hand_landmarks,
                self.mp_holistic.HAND_CONNECTIONS,
                self.mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=4),
                self.mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
            )
            
            return image
        except Exception as e:
            print(f"Error drawing landmarks: {e}", flush=True)
            return image
    
    def _draw_info(self, image, prediction=None, landmark_stats=None):
        """Draw prediction and landmark info on the image"""
        try:
            h, w = image.shape[:2]
            
            # Draw prediction
            if prediction and prediction.get('action'):
                text = f"Sign: {prediction['action']} ({prediction['confidence']:.2f})"
                cv2.putText(image, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                           1, (0, 255, 0), 2, cv2.LINE_AA)
            
            # Draw landmark stats
            if landmark_stats:
                y_offset = 60
                stats_text = [
                    f"Hands: {landmark_stats['hand_score']:.2f} ({landmark_stats['hand_count']})",
                    f"Pose: {landmark_stats['pose_score']:.2f}",
                    f"Face: {landmark_stats['face_score']:.2f}",
                    f"Total: {landmark_stats['total_score']:.2f}",
                    f"Threshold: {landmark_stats['threshold_used']:.2f}"
                ]
                
                for text in stats_text:
                    cv2.putText(image, text, (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX,
                               0.6, (255, 255, 255), 1, cv2.LINE_AA)
                    y_offset += 25
            
            return image
        except Exception as e:
            print(f"Error drawing info: {e}", flush=True)
            return image
    
    def process_frame(self, frame):
        """Process a single frame"""
        try:
            processed = self._preprocess_frame(frame)
            processed.flags.writeable = False
            results = self.holistic.process(processed)
            processed.flags.writeable = True
            image = cv2.cvtColor(processed, cv2.COLOR_RGB2BGR)
            
            if self.visualize:
                image = self._draw_landmarks(image, results)
            
            return image, results
        except Exception as e:
            print(f"Error processing frame: {e}", flush=True)
            return frame, None
    
    def extract_keypoints(self, results):
        """Extract keypoints from MediaPipe results"""
        try:
            pose = np.array([[lm.x, lm.y, lm.z, lm.visibility] for lm in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
            face = np.array([[lm.x, lm.y, lm.z] for lm in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(468*3)
            lh = np.array([[lm.x, lm.y, lm.z] for lm in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
            rh = np.array([[lm.x, lm.y, lm.z] for lm in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
            return np.concatenate([pose, face, lh, rh])
        except Exception as e:
            print(f"Error extracting keypoints: {e}", flush=True)
            return np.zeros(33*4 + 468*3 + 21*3 + 21*3)
    
    def has_sufficient_landmarks(self, results):
        """Check if we have sufficient landmarks for sign detection"""
        if results is None:
            return False, {
                'hand_score': 0,
                'pose_score': 0,
                'face_score': 0,
                'total_score': 0,
                'has_hands': False,
                'has_pose': False,
                'has_face': False,
                'hand_count': 0,
                'threshold_used': 0.4
            }
        
        try:
            has_hands = results.left_hand_landmarks is not None or results.right_hand_landmarks is not None
            has_pose = results.pose_landmarks is not None
            has_face = results.face_landmarks is not None
            
            hand_score = 0
            pose_score = 0
            face_score = 0
            hand_count = 0
            
            if results.left_hand_landmarks:
                hand_count += 1
                if len(results.left_hand_landmarks.landmark) >= 21:
                    x_coords = [lm.x for lm in results.left_hand_landmarks.landmark]
                    y_coords = [lm.y for lm in results.left_hand_landmarks.landmark]
                    coord_variance = np.var(x_coords) + np.var(y_coords)
                    hand_score += min(1.0, coord_variance * 10)
                else:
                    hand_score += 0.3
            
            if results.right_hand_landmarks:
                hand_count += 1
                if len(results.right_hand_landmarks.landmark) >= 21:
                    x_coords = [lm.x for lm in results.right_hand_landmarks.landmark]
                    y_coords = [lm.y for lm in results.right_hand_landmarks.landmark]
                    coord_variance = np.var(x_coords) + np.var(y_coords)
                    hand_score += min(1.0, coord_variance * 10)
                else:
                    hand_score += 0.3
            
            if hand_count > 0:
                hand_score = hand_score / hand_count
            
            if results.pose_landmarks:
                upper_body_indices = list(range(11, 17)) + list(range(23, 25))
                pose_visibilities = [results.pose_landmarks.landmark[i].visibility 
                                   for i in upper_body_indices 
                                   if i < len(results.pose_landmarks.landmark)]
                if pose_visibilities:
                    pose_score = np.mean(pose_visibilities)
            
            if results.face_landmarks:
                face_score = 0.7
            
            if has_hands:
                total_score = (hand_score * 0.7) + (pose_score * 0.2) + (face_score * 0.1)
                min_threshold = 0.15
            else:
                total_score = (pose_score * 0.7) + (face_score * 0.3)
                min_threshold = 0.4
            
            has_basic_structure = total_score > min_threshold
            
            if pose_score > 0.8 and has_pose:
                has_basic_structure = True
                
            if has_hands and hand_score > 0.1:
                has_basic_structure = True
            
            return has_basic_structure, {
                'hand_score': hand_score,
                'pose_score': pose_score,
                'face_score': face_score,
                'total_score': total_score,
                'has_hands': has_hands,
                'has_pose': has_pose,
                'has_face': has_face,
                'hand_count': hand_count,
                'threshold_used': min_threshold
            }
        except Exception as e:
            print(f"Error checking landmarks: {e}", flush=True)
            return False, {
                'hand_score': 0,
                'pose_score': 0,
                'face_score': 0,
                'total_score': 0,
                'has_hands': False,
                'has_pose': False,
                'has_face': False,
                'hand_count': 0,
                'threshold_used': 0.4,
                'error': str(e)
            }

    def process_image(self, image_path):
        """Process a single image for sign detection"""
        print(f"Processing image: {image_path}", flush=True)
        
        if not os.path.exists(image_path):
            print(f"Image file not found: {image_path}", flush=True)
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        frame = cv2.imread(image_path)
        if frame is None:
            print(f"Could not read image: {image_path}", flush=True)
            raise ValueError(f"Could not read image: {image_path}")
        
        print(f"Image loaded: {frame.shape}", flush=True)
        
        image, results = self.process_frame(frame)
        has_landmarks, landmark_stats = self.has_sufficient_landmarks(results)
        print(f"Landmarks detected: {has_landmarks}, stats: {landmark_stats}", flush=True)
        
        if not has_landmarks:
            print("Insufficient landmarks for detection", flush=True)
            if self.visualize:
                image = self._draw_info(image, None, landmark_stats)
                cv2.imshow('Sign Language Detection', image)
                cv2.waitKey(0)
                cv2.destroyAllWindows()
            return {'action': None, 'confidence': 0.0, 'error': 'Insufficient landmarks detected'}
        
        keypoints = self.extract_keypoints(results)
        sequence = [keypoints] * SEQUENCE_LENGTH
        
        try:
            res = self.model.predict(np.expand_dims(sequence, axis=0), verbose=0)[0]
            predicted_action = self.actions[np.argmax(res)]
            confidence = float(np.max(res))
            
            print(f"Prediction: {predicted_action}, confidence: {confidence}", flush=True)
            
            if self.visualize:
                prediction = {'action': predicted_action, 'confidence': confidence}
                image = self._draw_info(image, prediction, landmark_stats)
                cv2.imshow('Sign Language Detection', image)
                cv2.waitKey(0)
                cv2.destroyAllWindows()
            
            return {
                'action': predicted_action,
                'confidence': confidence,
                'sign': predicted_action,
                'landmark_stats': landmark_stats
            }
            
        except Exception as e:
            print(f"Prediction error: {e}", flush=True)
            if self.visualize:
                cv2.imshow('Sign Language Detection', image)
                cv2.waitKey(0)
                cv2.destroyAllWindows()
            return {'action': None, 'confidence': 0.0, 'error': str(e)}
    
    def process_video(self, video_path, max_frames=300):
        """Process video file and return predictions"""
        print(f"Starting video processing: {video_path}", flush=True)
        
        if not os.path.exists(video_path):
            print(f"Video file not found: {video_path}", flush=True)
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Could not open video: {video_path}", flush=True)
            raise ValueError(f"Could not open video: {video_path}")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count_total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count_total / fps if fps > 0 else 0
        
        print(f"Video info: {frame_count_total} frames, {fps:.2f} FPS, {duration:.2f}s", flush=True)
        
        sequence = []
        predictions = []
        frame_count = 0
        detection_stats = []
        last_progress = 0
        
        if self.visualize:
            cv2.namedWindow('Sign Language Detection', cv2.WINDOW_NORMAL)
        
        start_time = time.time()
        
        try:
            while cap.isOpened() and frame_count < max_frames:
                ret, frame = cap.read()
                if not ret:
                    print(f"End of video reached at frame {frame_count}", flush=True)
                    break
                    
                frame_count += 1
                
                progress = (frame_count / min(frame_count_total, max_frames)) * 100
                if progress - last_progress >= 20:
                    elapsed = time.time() - start_time
                    print(f"Processing: {progress:.1f}% ({frame_count}/{min(frame_count_total, max_frames)} frames, {elapsed:.1f}s)", flush=True)
                    last_progress = progress
                
                image, results = self.process_frame(frame)
                has_landmarks, landmark_stats = self.has_sufficient_landmarks(results)
                detection_stats.append(landmark_stats)
                
                keypoints = self.extract_keypoints(results)
                
                if has_landmarks:
                    self.frames_without_detection = 0
                    self.last_valid_keypoints = keypoints.copy()
                    sequence.append(keypoints)
                else:
                    self.frames_without_detection += 1
                    if (self.frames_without_detection <= self.max_frames_without_detection and 
                        self.last_valid_keypoints is not None and len(sequence) > 0):
                        decay_factor = 1.0 - (self.frames_without_detection / self.max_frames_without_detection) * 0.5
                        interpolated_keypoints = self.last_valid_keypoints * decay_factor
                        sequence.append(interpolated_keypoints)
                    else:
                        sequence = []
                        self.last_valid_keypoints = None
                        self.frames_without_detection = 0
                
                sequence = sequence[-SEQUENCE_LENGTH:]
                
                current_prediction = None
                if len(sequence) == SEQUENCE_LENGTH:
                    try:
                        res = self.model.predict(np.expand_dims(sequence, axis=0), verbose=0)[0]
                        predicted_action = self.actions[np.argmax(res)]
                        confidence = float(np.max(res))
                        
                        self.confidence_buffer.append((predicted_action, confidence))
                        
                        if len(self.confidence_buffer) >= 3:
                            smoothed_action, smoothed_confidence = self._smooth_predictions()
                            current_prediction = {
                                'action': smoothed_action,
                                'confidence': smoothed_confidence
                            }
                            predictions.append({
                                'action': smoothed_action,
                                'confidence': smoothed_confidence,
                                'raw_confidence': confidence,
                                'frame': frame_count
                            })
                    except Exception as e:
                        print(f"Prediction error at frame {frame_count}: {e}", flush=True)
                
                if self.visualize:
                    image = self._draw_info(image, current_prediction, landmark_stats)
                    cv2.imshow('Sign Language Detection', image)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        print("Visualization terminated by user", flush=True)
                        break
        
        except Exception as e:
            print(f"Error during video processing: {e}", flush=True)
            print(f"Traceback: {traceback.format_exc()}", flush=True)
        
        finally:
            cap.release()
            if self.visualize:
                cv2.destroyAllWindows()
            processing_time = time.time() - start_time
            print(f"Video processing completed: {frame_count} frames in {processing_time:.2f}s", flush=True)
        
        return predictions, detection_stats
    
    def _smooth_predictions(self):
        """Smooth predictions using recent history"""
        recent_predictions = list(self.confidence_buffer)
        
        action_confidences = {}
        for action, conf in recent_predictions:
            if action not in action_confidences:
                action_confidences[action] = []
            action_confidences[action].append(conf)
        
        best_action = None
        best_score = 0
        
        for action, confidences in action_confidences.items():
            avg_confidence = np.mean(confidences)
            frequency_weight = len(confidences) / len(recent_predictions)
            score = avg_confidence * (0.7 + 0.3 * frequency_weight)
            
            if score > best_score:
                best_score = score
                best_action = action
        
        return best_action, best_score
    
    def analyze_results(self, predictions, detection_stats, min_confidence=0.3):
        """Analyze predictions to determine final result"""
        print(f"Analyzing {len(predictions)} predictions...", flush=True)
        
        if not predictions:
            print("No predictions to analyze", flush=True)
            return {'action': None, 'confidence': 0.0, 'phrase': None}
        
        valid_predictions = [p for p in predictions if p['confidence'] >= min_confidence]
        print(f"{len(valid_predictions)} valid predictions (confidence >= {min_confidence})", flush=True)
        
        if not valid_predictions:
            print("No valid predictions", flush=True)
            return {'action': None, 'confidence': 0.0, 'phrase': None}
        
        action_stats = {}
        for pred in valid_predictions:
            action = pred['action']
            if action not in action_stats:
                action_stats[action] = {'confidences': [], 'count': 0}
            action_stats[action]['confidences'].append(pred['confidence'])
            action_stats[action]['count'] += 1
        
        best_action = None
        best_score = 0
        
        for action, stats in action_stats.items():
            avg_confidence = np.mean(stats['confidences'])
            max_confidence = np.max(stats['confidences'])
            consistency = stats['count'] / len(valid_predictions)
            score = avg_confidence * 0.5 + consistency * 0.3 + max_confidence * 0.2
            
            print(f"{action}: avg={avg_confidence:.3f}, max={max_confidence:.3f}, consistency={consistency:.3f}, score={score:.3f}", flush=True)
            
            if score > best_score:
                best_score = score
                best_action = action
        
        final_confidence = round(float(np.mean(action_stats[best_action]['confidences'])), 2)
        print(f"Final result: {best_action} (confidence: {final_confidence})", flush=True)
        
        return {
            'action': best_action, 
            'confidence': final_confidence,
            'phrase': best_action
        }


def main():
    print("Main function started", flush=True)
    
    try:
        parser = argparse.ArgumentParser()
        parser.add_argument('--video', help='Path to video file')
        parser.add_argument('--image', help='Path to image file')
        parser.add_argument('--test', action='store_true', help='Run test mode')
        parser.add_argument('--min_confidence', type=float, default=0.3, 
                           help='Minimum confidence threshold (0.0-1.0)')
        parser.add_argument('--visualize', action='store_true', help='Enable visualization')
        args = parser.parse_args()
        
        print(f"Arguments parsed: video={args.video}, image={args.image}, test={args.test}, visualize={args.visualize}", flush=True)
        
        if args.test:
            print("Test mode activated", flush=True)
            result = {'status': 'test_success', 'message': 'Python script is working'}
            print(json.dumps(result))
            return
        
        if not args.video and not args.image:
            print("Error: Either --video or --image argument is required", flush=True)
            result = {'action': None, 'confidence': 0.0, 'error': 'No input file specified'}
            print(json.dumps(result))
            return
        
        print("Creating detector...", flush=True)
        detector = SignLanguageDetector()
        detector.visualize = args.visualize
        
        if args.image:
            print("Processing image...", flush=True)
            result = detector.process_image(args.image)
        else:
            print("Processing video...", flush=True)
            predictions, detection_stats = detector.process_video(args.video)
            result = detector.analyze_results(predictions, detection_stats, args.min_confidence)
        
        print("Processing complete, outputting result...", flush=True)
        print(json.dumps(result))
        
    except Exception as e:
        print(f"Fatal error in main: {e}", flush=True)
        print(f"Traceback: {traceback.format_exc()}", flush=True)
        error_result = {'action': None, 'confidence': 0.0, 'error': str(e)}
        print(json.dumps(error_result))


if __name__ == "__main__":
    main()