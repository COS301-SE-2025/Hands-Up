from fastapi import APIRouter, WebSocket, UploadFile, File, WebSocketDisconnect
from typing import List
import numpy as np
from controllers.lettersController import detectFromImage, early_detect
import logging
import json
import asyncio

router = APIRouter()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('server.log')
    ]
)
logger = logging.getLogger(__name__)

@router.post("/processLetters")
async def process_letters(frames: List[UploadFile] = File(...)):
    sequence_list = []
    for frame in frames:
        pass
    return detectFromImage(sequence_list)

@router.post("/processWords")
async def process_words(frames: List[UploadFile] = File(...)):
    sequence_list = []
    for frame in frames:
        pass
    return detect_words(sequence_list)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection accepted")
    buffer = []
    current_model = "alpha"
    seq_num = 20
    connected = True

    try:
        while connected:
            try:
                data = await asyncio.wait_for(websocket.receive_json(), timeout=2.0)
                logger.info(f"Received message type: {data.get('type')}")
                
                msg_type = data.get('type')
                if not msg_type:
                    continue

                if msg_type == 'config':
                    current_model = data.get('model', current_model)
                    seq_num = data.get('sequenceNum', seq_num)
                    logger.info(f"Config set: model={current_model}, seq_num={seq_num}")
                elif msg_type == 'reset':
                    buffer = []
                    logger.info("Buffer reset")
                elif msg_type == 'frame':
                    landmarks = data.get('landmarks')
                    if landmarks is not None and (not isinstance(landmarks, list) or len(landmarks) != 63):
                        logger.warning(f"Invalid landmarks format: {len(landmarks) if isinstance(landmarks, list) else type(landmarks)}")
                        continue
                    buffer.append(landmarks)
                    logger.info(f"Frame added: buffer_size={len(buffer)}/{seq_num}, landmarks={'valid' if landmarks else 'null'}")
                    if current_model != 'glosses' and len(buffer) == 2:
                        result = early_detect(buffer, current_model)
                        if result is not None:
                            logger.info(f"Early inference completed, sending result: {result}")
                            await websocket.send_json({'type': 'result', **result})
                            buffer = []
                    if len(buffer) == seq_num:
                        logger.info(f"Buffer full ({seq_num} frames), calling full inference for model={current_model}")
                        if current_model == 'glosses':
                            result = detect_words(buffer)
                        else:
                            result = detectFromImage(buffer)
                        logger.info(f"Full inference completed, sending result: {result}")
                        await websocket.send_json({'type': 'result', **result})
                        buffer = []
                else:
                    logger.warning(f"Unknown message type: {msg_type}")
            except asyncio.TimeoutError:
                continue
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON: {e}")
                continue
            except Exception as e:
                logger.error(f"Processing error: {e}")
                if "disconnect" in str(e).lower() or "receive" in str(e).lower():
                    connected = False
                continue
    except WebSocketDisconnect as e:
        logger.info(f"WebSocket disconnected: code={e.code}, reason={e.reason}")
        connected = False
    finally:
        logger.info("Closing WebSocket connection")
        await websocket.close(code=1000, reason="Normal closure")