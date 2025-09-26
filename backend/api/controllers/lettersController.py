import numpy as np
import tensorflow as tf
import pickle
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('inference.log')
    ]
)
logger = logging.getLogger(__name__)
logger.debug("Inference module loaded")

# Load models (adjust paths as needed)
logger.info("Loading models...")
lettersModel = tf.keras.models.load_model('../../ai_model/models/detectLettersModel.keras')
with open('../../ai_model/models/labelEncoder.pickle', 'rb') as f:
    labelEncoder = pickle.load(f)

lettersModel2 = tf.keras.models.load_model('../../ai_model/jz_model/JZModel.keras')
with open('../../ai_model/jz_model/labelEncoder.pickle', 'rb') as f:
    labelEncoder2 = pickle.load(f)

numbersModel = tf.keras.models.load_model('../../ai_model/models/detectNumbersModel.keras')
with open('../../ai_model/models/numLabelEncoder.pickle', 'rb') as f:
    numLabelEncoder = pickle.load(f)

# # Placeholder for gloss model (adapt to your actual model)
# glossModel = tf.keras.models.load_model('../../ai_model/models/detectGlossModel.keras')  # Adjust path
# with open('../../ai_model/models/glossLabelEncoder.pickle', 'rb') as f:  # Adjust path
#     glossLabelEncoder = pickle.load(f)
logger.info("Models loaded successfully")

sequenceNum = 20

def early_detect(sequence_list, model):
    logger.info(f"Running early_detect for model={model} with 2 frames")
    if len(sequence_list) != 2 or sequence_list[0] is None or sequence_list[1] is None:
        logger.info("Invalid for early detection")
        return None

    # Static on first frame
    data_aux1 = [sequence_list[0][i] for i in range(63) if i % 3 != 2]
    input_data1 = np.array(data_aux1, dtype=np.float32).reshape(1, 42, 1)
    prediction_letter1 = lettersModel.predict(input_data1, verbose=0)
    index_letter1 = np.argmax(prediction_letter1, axis=1)[0]
    confidence_letter1 = float(np.max(prediction_letter1))
    label_letter1 = labelEncoder.inverse_transform([index_letter1])[0]

    prediction_num1 = numbersModel.predict(input_data1, verbose=0)
    index_num1 = np.argmax(prediction_num1, axis=1)[0]
    confidence_num1 = float(np.max(prediction_num1))
    label_num1 = numLabelEncoder.inverse_transform([index_num1])[0]

    # Static on second frame
    data_aux2 = [sequence_list[1][i] for i in range(63) if i % 3 != 2]
    input_data2 = np.array(data_aux2, dtype=np.float32).reshape(1, 42, 1)
    prediction_letter2 = lettersModel.predict(input_data2, verbose=0)
    index_letter2 = np.argmax(prediction_letter2, axis=1)[0]
    confidence_letter2 = float(np.max(prediction_letter2))
    label_letter2 = labelEncoder.inverse_transform([index_letter2])[0]

    prediction_num2 = numbersModel.predict(input_data2, verbose=0)
    index_num2 = np.argmax(prediction_num2, axis=1)[0]
    confidence_num2 = float(np.max(prediction_num2))
    label_num2 = numLabelEncoder.inverse_transform([index_num2])[0]

    # Confirmation logic
    confirmed = False
    if model == 'alpha':
        if label_letter1 == label_letter2 and label_letter1 not in ['J', 'Z']:
            confirmed = True
            label_letter = label_letter1
            confidence_letter = max(confidence_letter1, confidence_letter2)
            label_num = label_num1  # Or average, but since not primary, use first
            confidence_num = confidence_num1
    elif model == 'num':
        if label_num1 == label_num2:
            confirmed = True
            label_num = label_num1
            confidence_num = max(confidence_num1, confidence_num2)
            label_letter = label_letter1  # Use first
            confidence_letter = confidence_letter1
    else:
        return None

    if confirmed:
        logger.info(f"Early confirmation: letter={label_letter}, num={label_num}")
        return {'letter': label_letter, 'confidenceLetter': confidence_letter, 'number': label_num, 'confidenceNumber': confidence_num}
    else:
        logger.info("No early confirmation, need full sequence")
        return None

def detectFromImage(sequence_list):
    logger.info(f"Running detectFromImage with sequence length: {len(sequence_list)}")
    processed_sequence = sequence_list.copy()

    # Interpolate missing frames
    for i in range(len(processed_sequence)):
        if processed_sequence[i] is None:
            logger.info(f"Interpolating missing frame at index {i}")
            prevIdx, nextIdx = -1, -1
            
            for j in range(i - 1, -1, -1):
                if processed_sequence[j] is not None:
                    prevIdx = j
                    break
            
            for j in range(i + 1, len(processed_sequence)):
                if processed_sequence[j] is not None:
                    nextIdx = j
                    break

            if prevIdx != -1 and nextIdx != -1:
                prevData = np.array(processed_sequence[prevIdx])
                nextData = np.array(processed_sequence[nextIdx])
                t = (i - prevIdx) / (nextIdx - prevIdx)
                interpolatedData = prevData + (nextData - prevData) * t
                processed_sequence[i] = interpolatedData.tolist()
            elif prevIdx != -1:
                processed_sequence[i] = processed_sequence[prevIdx]
            elif nextIdx != -1:
                processed_sequence[i] = processed_sequence[nextIdx]

    if None in processed_sequence:
        logger.info("Unable to interpolate all frames, returning empty result")
        return {'letter': '', 'confidenceLetter': 0.0, 'number': '', 'confidenceNumber': 0.0}

    input_data2 = np.array(processed_sequence, dtype=np.float32).reshape(1, len(sequence_list), 63)
    logger.info(f"Input shape for lettersModel2: {input_data2.shape}")
    prediction2 = lettersModel2.predict(input_data2, verbose=0)
    index2 = np.argmax(prediction2, axis=1)[0]
    confidence2 = float(np.max(prediction2))
    label2 = labelEncoder2.inverse_transform([index2])[0]
    logger.info(f"lettersModel2 prediction: label={label2}, confidence={confidence2}")

    # Fallback with last frame for static models
    last_landmarks = processed_sequence[-1]
    data_aux = [last_landmarks[i] for i in range(63) if i % 3 != 2]  # Extract x,y only (42 values)
    input_data1 = np.array(data_aux, dtype=np.float32).reshape(1, 42, 1)
    logger.info(f"Input shape for lettersModel: {input_data1.shape}")

    prediction1 = lettersModel.predict(input_data1, verbose=0)
    index1 = np.argmax(prediction1, axis=1)[0]
    confidence1 = float(np.max(prediction1))
    label1 = labelEncoder.inverse_transform([index1])[0]
    logger.info(f"lettersModel prediction: label={label1}, confidence={confidence1}")

    prediction3 = numbersModel.predict(input_data1, verbose=0)
    index3 = np.argmax(prediction3, axis=1)[0]
    confidence3 = float(np.max(prediction3))
    label3 = numLabelEncoder.inverse_transform([index3])[0]
    logger.info(f"numbersModel prediction: label={label3}, confidence={confidence3}")

    if label1 == label2:
        logger.info(f"Returning consistent result: letter={label2}, confidence={confidence2}")
        return {'letter': label2, 'confidenceLetter': confidence2, 'number': label3, 'confidenceNumber': confidence3}
    else:
        logger.info(f"Returning lettersModel result: letter={label1}, confidence={confidence1}")
        return {'letter': label1, 'confidenceLetter': confidence1, 'number': label3, 'confidenceNumber': confidence3}

# def detect_words(sequence_list):
#     logger.info(f"Running detect_words with sequence length: {len(sequence_list)}")
#     processed_sequence = sequence_list.copy()

#     # Interpolate missing frames
#     for i in range(len(processed_sequence)):
#         if processed_sequence[i] is None:
#             logger.info(f"Interpolating missing frame at index {i}")
#             prevIdx, nextIdx = -1, -1
            
#             for j in range(i - 1, -1, -1):
#                 if processed_sequence[j] is not None:
#                     prevIdx = j
#                     break
            
#             for j in range(i + 1, len(processed_sequence)):
#                 if processed_sequence[j] is not None:
#                     nextIdx = j
#                     break

#             if prevIdx != -1 and nextIdx != -1:
#                 prevData = np.array(processed_sequence[prevIdx])
#                 nextData = np.array(processed_sequence[nextIdx])
#                 t = (i - prevIdx) / (nextIdx - prevIdx)
#                 interpolatedData = prevData + (nextData - prevData) * t
#                 processed_sequence[i] = interpolatedData.tolist()
#             elif prevIdx != -1:
#                 processed_sequence[i] = processed_sequence[prevIdx]
#             elif nextIdx != -1:
#                 processed_sequence[i] = processed_sequence[nextIdx]

#     if None in processed_sequence:
#         logger.info("Unable to interpolate all frames, returning empty result")
#         return {'word': '', 'confidence': 0.0}

#     input_data = np.array(processed_sequence, dtype=np.float32).reshape(1, len(sequence_list), 63)
#     logger.info(f"Input shape for glossModel: {input_data.shape}")
#     prediction = glossModel.predict(input_data, verbose=0)
#     index = np.argmax(prediction, axis=1)[0]
#     confidence = float(np.max(prediction))
#     word = glossLabelEncoder.inverse_transform([index])[0]
#     logger.info(f"glossModel prediction: word={word}, confidence={confidence}")
#     return {'word': word, 'confidence': confidence}